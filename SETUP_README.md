# ShafesChannel - Real-time Video Content Platform

## 🚀 Quick Setup Guide

### 1. Environment Setup
```powershell
# Copy environment templates
copy backend\.env.template backend\.env
copy src\.env.template .env.local

# Edit the .env files with your actual values
# Required: MONGO_URI, JWT_SECRET
```

### 2. Database Setup
Make sure MongoDB is running on your system:
```powershell
# Start MongoDB (if using local installation)
mongod

# Or if you have MongoDB as a service:
net start mongodb
```

### 3. Install Dependencies
```powershell
# Install frontend dependencies (socket.io-client should be added)
npm install socket.io-client

# Backend dependencies are already mostly installed
# You can verify by checking backend/package.json
```

### 4. Start the Application
```powershell
# Terminal 1 - Start Backend
cd backend
npm run dev

# Terminal 2 - Start Frontend
npm run dev
```

## 🔑 Default Admin Credentials
- Email: admin@shafeschannel.com
- Password: admin123

## 📊 API Endpoints

### Authentication
- `POST /api/users/signup` - User registration
- `POST /api/users/login` - User login
- `POST /api/auth/google` - Google OAuth
- `POST /api/admin/login` - Admin login

### Posts (Content)
- `GET /api/posts` - Get published posts (requires subscription)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts/:id/like` - Toggle like
- `POST /api/posts/:id/comment` - Add comment

### Admin Posts
- `GET /api/admin/posts` - Get all posts (admin)
- `POST /api/admin/posts` - Create post (admin)
- `PUT /api/admin/posts/:id` - Update post (admin)
- `DELETE /api/admin/posts/:id` - Delete post (admin)

### Subscriptions
- `POST /api/subscribe` - Subscribe to channel
- `POST /api/unsubscribe` - Unsubscribe
- `GET /api/subscription/status` - Get subscription status

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

## 📁 Project Structure

```
ShafesChannel/
├── backend/
│   ├── models/
│   │   ├── Post.js          # Video/content posts
│   │   ├── Subscription.js  # User subscriptions
│   │   └── Admin.js         # Admin model
│   ├── routes/
│   │   ├── authRoutes.js    # Authentication routes
│   │   ├── postRoutes.js    # Content management
│   │   └── subscriptionRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js # JWT & subscription verification
│   ├── uploads/             # File upload directory
│   ├── server-new.js        # New Socket.io enabled server
│   └── package.json
├── src/
│   ├── services/
│   │   ├── api.js           # API utility functions
│   │   └── socket.js        # Socket.io client
│   ├── context/
│   │   └── AuthContext.jsx  # Authentication state
│   └── .env.template
└── SETUP_README.md
```

## 🔧 Environment Variables

### Backend (.env)
```env
MONGO_URI=mongodb://localhost:27017/shafeschannel
JWT_SECRET=your_secure_secret_here
PORT=5000
GOOGLE_CLIENT_ID=optional_google_client_id
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=optional_google_client_id
```

Happy coding! 🎬✨

## 📞 Troubleshooting

**MongoDB Connection Issues:**
- Ensure MongoDB is running: `mongod` or start the service
- Check if port 27017 is available
- Verify MONGO_URI in backend/.env

**Port Conflicts:**
- Backend runs on port 5000
- Frontend runs on port 5173
- Make sure these ports are available

**File Upload Issues:**
- Ensure backend/uploads directory exists and has write permissions