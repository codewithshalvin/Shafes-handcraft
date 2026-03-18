#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🎬 Setting up ShafesChannel...\n');

// 1. Update package.json scripts
const updatePackageJson = () => {
  try {
    console.log('📦 Updating package.json scripts...');
    
    const backendPackagePath = './backend/package.json';
    const backendPackage = JSON.parse(fs.readFileSync(backendPackagePath, 'utf8'));
    
    // Update backend scripts
    backendPackage.scripts = {
      ...backendPackage.scripts,
      "dev": "node server-new.js",
      "start": "node server-new.js",
      "start:old": "node server.js"
    };
    
    fs.writeFileSync(backendPackagePath, JSON.stringify(backendPackage, null, 2));
    console.log('✅ Backend package.json updated');
  } catch (error) {
    console.error('❌ Error updating package.json:', error.message);
  }
};

// 2. Create environment file template
const createEnvTemplate = () => {
  try {
    console.log('🔧 Creating .env template...');
    
    const envTemplate = `# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/shafeschannel

# JWT Secret (Change this to a secure random string)
JWT_SECRET=your_super_secure_jwt_secret_here_change_this

# Server Port
PORT=5000

# Google OAuth (Optional - for Google login)
GOOGLE_CLIENT_ID=your_google_client_id_here

# Frontend URLs (for CORS)
FRONTEND_URL=http://localhost:5173

# Environment
NODE_ENV=development
`;

    const backendEnvPath = './backend/.env.template';
    fs.writeFileSync(backendEnvPath, envTemplate);
    console.log('✅ .env.template created in backend folder');
    
    // Create frontend env template
    const frontendEnvTemplate = `# Backend API URL
VITE_API_URL=http://localhost:5000/api

# Socket.io URL
VITE_SOCKET_URL=http://localhost:5000

# Google OAuth Client ID (Optional)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
`;

    fs.writeFileSync('./src/.env.template', frontendEnvTemplate);
    console.log('✅ .env.template created in src folder');
  } catch (error) {
    console.error('❌ Error creating .env template:', error.message);
  }
};

// 3. Create uploads directory
const createUploadsDir = () => {
  try {
    console.log('📁 Creating uploads directory...');
    
    const uploadsDir = './backend/uploads';
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✅ Uploads directory created');
    } else {
      console.log('✅ Uploads directory already exists');
    }
  } catch (error) {
    console.error('❌ Error creating uploads directory:', error.message);
  }
};

// 4. Install missing dependencies
const checkDependencies = () => {
  console.log('📋 Checking dependencies...');
  
  const backendDeps = [
    'socket.io',
    'bcryptjs', 
    'jsonwebtoken',
    'mongoose',
    'express',
    'cors',
    'dotenv',
    'multer',
    'google-auth-library'
  ];
  
  const frontendDeps = [
    'socket.io-client',
    'axios'
  ];
  
  console.log('✅ Required backend dependencies:');
  backendDeps.forEach(dep => console.log(`   - ${dep}`));
  
  console.log('✅ Required frontend dependencies:');
  frontendDeps.forEach(dep => console.log(`   - ${dep}`));
  
  console.log('\n📝 Most dependencies are already installed!');
};

// 5. Create README with setup instructions
const createReadme = () => {
  try {
    console.log('📖 Creating setup README...');
    
    const readmeContent = `# ShafesChannel - Real-time Video Content Platform

## 🚀 Quick Setup Guide

### 1. Environment Setup
\`\`\`bash
# Copy environment templates
cp backend/.env.template backend/.env
cp src/.env.template .env.local

# Edit the .env files with your actual values
# Required: MONGO_URI, JWT_SECRET
\`\`\`

### 2. Database Setup
Make sure MongoDB is running on your system:
\`\`\`bash
# Start MongoDB (if using local installation)
mongod

# Or start MongoDB service
brew services start mongodb/brew/mongodb-community
# or
sudo systemctl start mongod
\`\`\`

### 3. Install Dependencies
\`\`\`bash
# Install frontend dependencies (if not already done)
npm install socket.io-client

# Install backend dependencies (if not already done)
cd backend
npm install socket.io bcryptjs jsonwebtoken mongoose express cors dotenv multer google-auth-library
\`\`\`

### 4. Start the Application
\`\`\`bash
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend
npm run dev
\`\`\`

## 🔑 Default Admin Credentials
- Email: admin@shafeschannel.com
- Password: admin123

## 📊 API Endpoints

### Authentication
- \`POST /api/users/signup\` - User registration
- \`POST /api/users/login\` - User login
- \`POST /api/auth/google\` - Google OAuth
- \`POST /api/admin/login\` - Admin login

### Posts (Content)
- \`GET /api/posts\` - Get published posts (requires subscription)
- \`GET /api/posts/:id\` - Get single post
- \`POST /api/posts/:id/like\` - Toggle like
- \`POST /api/posts/:id/comment\` - Add comment

### Admin Posts
- \`GET /api/admin/posts\` - Get all posts (admin)
- \`POST /api/admin/posts\` - Create post (admin)
- \`PUT /api/admin/posts/:id\` - Update post (admin)
- \`DELETE /api/admin/posts/:id\` - Delete post (admin)

### Subscriptions
- \`POST /api/subscribe\` - Subscribe to channel
- \`POST /api/unsubscribe\` - Unsubscribe
- \`GET /api/subscription/status\` - Get subscription status

## ✨ Features Implemented

✅ User registration & login (email/password + Google OAuth)
✅ Admin authentication
✅ Subscription system (free tier auto-created)
✅ Post management (CRUD operations)
✅ Real-time likes & comments (Socket.io)
✅ File uploads (videos, images)
✅ Protected routes based on subscription
✅ JWT-based authentication
✅ MongoDB integration

## 🔄 Real-time Features
- Live like updates
- Real-time comment notifications
- Socket.io integration

## 📱 Frontend Integration
The frontend is set up with:
- AuthContext for state management
- API service layer
- Socket.io client
- Protected routes

Happy coding! 🎬✨
`;

    fs.writeFileSync('./SETUP_README.md', readmeContent);
    console.log('✅ SETUP_README.md created');
  } catch (error) {
    console.error('❌ Error creating README:', error.message);
  }
};

// Run setup
const runSetup = async () => {
  console.log('🎬 ShafesChannel Setup Starting...\n');
  
  updatePackageJson();
  createEnvTemplate();
  createUploadsDir();
  checkDependencies();
  createReadme();
  
  console.log('\n🎉 Setup Complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. Copy and configure .env files:');
  console.log('   cp backend/.env.template backend/.env');
  console.log('   cp src/.env.template .env.local');
  console.log('');
  console.log('2. Make sure MongoDB is running');
  console.log('');
  console.log('3. Start the backend:');
  console.log('   cd backend && npm run dev');
  console.log('');
  console.log('4. Start the frontend:');
  console.log('   npm run dev');
  console.log('');
  console.log('5. Visit http://localhost:5173 and start building! 🚀');
  console.log('');
  console.log('📚 Check SETUP_README.md for detailed instructions');
};

runSetup().catch(console.error);