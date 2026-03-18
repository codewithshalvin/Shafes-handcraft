import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    type: String // Array of image paths
  }],
  category: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  allowCustomization: {
    type: Boolean,
    default: true
  },
  allowReferencePhotos: {
    type: Boolean,
    default: true
  },
  maxReferencePhotos: {
    type: Number,
    default: 10
  },
  tags: [{
    type: String
  }],
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better performance
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ featured: 1, isActive: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;