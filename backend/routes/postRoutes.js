import express from 'express';
import multer from 'multer';
import path from 'path';
import Post from '../models/Post.js';
import { verifyToken, verifyAdmin, verifySubscription } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'), false);
    }
  }
});

// ==================== ADMIN ROUTES (Protected) ====================

// Create new post (Admin only)
router.post('/admin/posts', verifyAdmin, upload.fields([
  { name: 'content', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
  { name: 'photos', maxCount: 10 }
]), async (req, res) => {
  try {
    const { title, description, type, category, tags, isPublished, duration } = req.body;

    // Validation
    if (!title || !description || !type || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (!req.files || !req.files.content || !req.files.thumbnail) {
      return res.status(400).json({
        success: false,
        message: 'Content file and thumbnail are required'
      });
    }

    // Get file paths
    const contentPath = `/uploads/${req.files.content[0].filename}`;
    const thumbnailPath = `/uploads/${req.files.thumbnail[0].filename}`;
    
    // Handle multiple photos
    let photoPaths = [];
    if (req.files.photos) {
      photoPaths = req.files.photos.map(file => `/uploads/${file.filename}`);
    }

    // Parse tags if they exist
    let parsedTags = [];
    if (tags) {
      parsedTags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
    }

    // Create post
    const post = await Post.create({
      title,
      description,
      content: contentPath,
      thumbnail: thumbnailPath,
      photos: photoPaths,
      type,
      category,
      tags: parsedTags,
      isPublished: isPublished === 'true',
      duration: duration ? parseInt(duration) : 0,
      adminId: req.adminId
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating post'
    });
  }
});

// Get all posts for admin (including unpublished)
router.get('/admin/posts', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, type, search } = req.query;
    
    const query = {};
    
    if (category) query.category = category;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await Post.find(query)
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      posts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get admin posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching posts'
    });
  }
});

// Update post (Admin only)
router.put('/admin/posts/:id', verifyAdmin, upload.fields([
  { name: 'content', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
  { name: 'photos', maxCount: 10 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, category, tags, isPublished, duration } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Update fields
    if (title) post.title = title;
    if (description) post.description = description;
    if (type) post.type = type;
    if (category) post.category = category;
    if (tags) {
      post.tags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
    }
    if (isPublished !== undefined) post.isPublished = isPublished === 'true';
    if (duration) post.duration = parseInt(duration);

    // Update files if provided
    if (req.files) {
      if (req.files.content) {
        post.content = `/uploads/${req.files.content[0].filename}`;
      }
      if (req.files.thumbnail) {
        post.thumbnail = `/uploads/${req.files.thumbnail[0].filename}`;
      }
      if (req.files.photos) {
        post.photos = req.files.photos.map(file => `/uploads/${file.filename}`);
      }
    }

    await post.save();

    res.json({
      success: true,
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating post'
    });
  }
});

// Delete post (Admin only)
router.delete('/admin/posts/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await Post.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting post'
    });
  }
});

// ==================== PUBLIC/USER ROUTES ====================

// Get published posts (requires subscription)
router.get('/posts', verifyToken, verifySubscription, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, type, search } = req.query;
    
    const query = { isPublished: true };
    
    if (category) query.category = category;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await Post.find(query)
      .populate('adminId', 'name')
      .populate({
        path: 'comments.userId',
        select: 'name avatar'
      })
      .sort({ publishDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(query);

    res.json({
      success: true,
      posts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching posts'
    });
  }
});

// Get single post (requires subscription)
router.get('/posts/:id', verifyToken, verifySubscription, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findOne({ _id: id, isPublished: true })
      .populate('adminId', 'name')
      .populate({
        path: 'comments.userId',
        select: 'name avatar'
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or not published'
      });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    res.json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching post'
    });
  }
});

// Like/Unlike post
router.post('/posts/:id/like', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findOne({ _id: id, isPublished: true });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user already liked the post
    const existingLike = post.likes.find(like => like.userId.toString() === userId.toString());

    if (existingLike) {
      // Unlike the post
      post.likes = post.likes.filter(like => like.userId.toString() !== userId.toString());
      await post.save();
      
      res.json({
        success: true,
        message: 'Post unliked successfully',
        liked: false,
        likeCount: post.likes.length
      });
    } else {
      // Like the post
      post.likes.push({ userId });
      await post.save();
      
      res.json({
        success: true,
        message: 'Post liked successfully',
        liked: true,
        likeCount: post.likes.length
      });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing like'
    });
  }
});

// Add comment to post
router.post('/posts/:id/comment', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const post = await Post.findOne({ _id: id, isPublished: true });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Add comment
    const newComment = {
      userId,
      content: content.trim(),
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    // Populate the new comment with user info
    await post.populate({
      path: 'comments.userId',
      select: 'name avatar'
    });

    const addedComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: addedComment,
      commentCount: post.comments.length
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding comment'
    });
  }
});

// Like/Unlike comment
router.post('/posts/:postId/comments/:commentId/like', verifyToken, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user._id;

    const post = await Post.findOne({ _id: postId, isPublished: true });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user already liked the comment
    const existingLike = comment.likes.find(like => like.userId.toString() === userId.toString());

    if (existingLike) {
      // Unlike the comment
      comment.likes = comment.likes.filter(like => like.userId.toString() !== userId.toString());
    } else {
      // Like the comment
      comment.likes.push({ userId });
    }

    await post.save();

    res.json({
      success: true,
      message: existingLike ? 'Comment unliked successfully' : 'Comment liked successfully',
      liked: !existingLike,
      likeCount: comment.likes.length
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing comment like'
    });
  }
});

export default router;