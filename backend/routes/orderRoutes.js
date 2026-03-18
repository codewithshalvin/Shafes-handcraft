import express from 'express';
import multer from 'multer';
import path from 'path';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for reference photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/reference-photos/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 10 // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// ==================== ADMIN ROUTES ====================

// Get all orders (Admin only)
router.get('/admin/orders', verifyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching orders'
    });
  }
});

// Get single order details (Admin only)
router.get('/admin/orders/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('items.product', 'name price images category');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching order'
    });
  }
});

// Update order status (Admin only)
router.put('/admin/orders/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    if (adminNotes) order.adminNotes = adminNotes;
    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating order status'
    });
  }
});

// ==================== PUBLIC ROUTES ====================

// Create new order
router.post('/orders', upload.array('referencePhotos', 10), async (req, res) => {
  try {
    const { customerInfo, items, totalAmount, notes } = req.body;

    // Parse customer info and items if they're strings
    const customer = typeof customerInfo === 'string' ? JSON.parse(customerInfo) : customerInfo;
    const orderItems = typeof items === 'string' ? JSON.parse(items) : items;

    if (!customer || !orderItems || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Process uploaded reference photos
    const referencePhotos = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      path: `/uploads/reference-photos/${file.filename}`
    })) : [];

    // Create order items with reference photos
    const processedItems = orderItems.map((item, index) => {
      // If this item has reference photos, assign them
      const itemPhotos = referencePhotos.filter(photo => 
        photo.originalName.includes(`item_${index}`) || referencePhotos.length === 1
      );

      return {
        ...item,
        referencePhotos: itemPhotos
      };
    });

    // If only one item and multiple photos, assign all photos to that item
    if (processedItems.length === 1 && referencePhotos.length > 0) {
      processedItems[0].referencePhotos = referencePhotos;
    }

    const order = await Order.create({
      customer,
      items: processedItems,
      totalAmount: parseFloat(totalAmount),
      notes
    });

    // Populate product details
    await order.populate('items.product', 'name price images');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating order'
    });
  }
});

// Get order by order number (for customers)
router.get('/orders/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const order = await Order.findOne({ orderNumber })
      .populate('items.product', 'name price images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order by number error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching order'
    });
  }
});

export default router;