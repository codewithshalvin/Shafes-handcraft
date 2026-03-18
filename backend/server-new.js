import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

// Import models
import Post from "./models/Post.js";
import User from "./models/User.js";
import Subscription from "./models/Subscription.js";
import Order from "./models/Order.js";
import Product from "./models/Product.js";

dotenv.config();

const app = express();
const server = createServer(app);

// ✅ Configure CORS for both Express and Socket.io
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173','https://your-shafe.onrender.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie']
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ Setup Socket.io with CORS
const io = new Server(server, {
  cors: corsOptions
});

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

// ✅ serve uploads folder
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/uploads/reference-photos", express.static(path.join(process.cwd(), "uploads/reference-photos")));

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing in .env file");
  process.exit(1);
}

// ======================== DB CONNECTION ========================
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  });

// ======================== SOCKET.IO SETUP ========================
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // Join post room for real-time updates
  socket.on('join-post', (postId) => {
    socket.join(`post-${postId}`);
    console.log(`User ${socket.id} joined post room: post-${postId}`);
  });

  // Leave post room
  socket.on('leave-post', (postId) => {
    socket.leave(`post-${postId}`);
    console.log(`User ${socket.id} left post room: post-${postId}`);
  });

  // Handle real-time like
  socket.on('like-post', async (data) => {
    try {
      const { postId, userId } = data;
      
      // Emit to all users in the post room
      socket.to(`post-${postId}`).emit('post-liked', {
        postId,
        userId,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Socket like error:', error);
    }
  });

  // Handle real-time comment
  socket.on('new-comment', async (data) => {
    try {
      const { postId, comment } = data;
      
      // Emit to all users in the post room
      socket.to(`post-${postId}`).emit('comment-added', {
        postId,
        comment,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Socket comment error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('👋 User disconnected:', socket.id);
  });
});

// ======================== ROUTES ========================

// API Routes
app.use('/api', authRoutes);
app.use('/api', postRoutes);
app.use('/api', subscriptionRoutes);
app.use('/api', orderRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'ShafesChannel API is running!',
    timestamp: new Date().toISOString()
  });
});

// Create default admin if none exists
const createDefaultAdmin = async () => {
  try {
    const { default: bcrypt } = await import('bcryptjs');
    const { default: Admin } = await import('./models/Admin.js');
    
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const admin = await Admin.create({
        name: 'Admin',
        email: 'admin@shafeschannel.com',
        password: hashedPassword
      });
      
      console.log('✅ Default admin created:', admin.email);
      console.log('🔑 Default password: admin123');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
  }
};

// ======================== ERROR HANDLING ========================
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ======================== START SERVER ========================
server.listen(PORT, async () => {
  console.log(`🚀 ShafesChannel Server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:5173`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  
  // Create default admin
  await createDefaultAdmin();
});

export default app;
export { io };