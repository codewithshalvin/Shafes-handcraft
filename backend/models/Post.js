import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: String, // Main content file path
    required: true
  },
  thumbnail: {
    type: String, // Thumbnail image path
    required: true
  },
  photos: [{
    type: String // Array of photo paths for multiple photos
  }],
  type: {
    type: String,
    required: true,
    enum: ['video', 'image', 'text']
  },
  category: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number, // Duration in seconds for videos
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    likes: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
postSchema.index({ category: 1, isPublished: 1 });
postSchema.index({ type: 1, isPublished: 1 });
postSchema.index({ isPublished: 1, publishDate: -1 });
postSchema.index({ adminId: 1 });

const Post = mongoose.model('Post', postSchema);

export default Post;