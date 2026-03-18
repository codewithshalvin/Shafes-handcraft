import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================

export const authAPI = {
  // User registration
  register: (userData) => api.post('/users/signup', userData),
  
  // User login
  login: (credentials) => api.post('/users/login', credentials),
  
  // Google OAuth
  googleAuth: (credential) => api.post('/auth/google', { credential }),
  
  // Admin login
  adminLogin: (credentials) => api.post('/admin/login', credentials),
  
  // Get user profile
  getProfile: () => api.get('/users/profile'),
};

// ==================== POSTS API ====================

export const postsAPI = {
  // Get published posts (user)
  getPosts: (params = {}) => api.get('/posts', { params }),
  
  // Get single post
  getPost: (id) => api.get(`/posts/${id}`),
  
  // Like/unlike post
  toggleLike: (id) => api.post(`/posts/${id}/like`),
  
  // Add comment
  addComment: (id, content) => api.post(`/posts/${id}/comment`, { content }),
  
  // Like/unlike comment
  toggleCommentLike: (postId, commentId) => 
    api.post(`/posts/${postId}/comments/${commentId}/like`),

  // Admin - Get all posts
  adminGetPosts: (params = {}) => api.get('/admin/posts', { params }),
  
  // Admin - Create post
  adminCreatePost: (formData) => 
    api.post('/admin/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  // Admin - Update post
  adminUpdatePost: (id, formData) => 
    api.put(`/admin/posts/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  // Admin - Delete post
  adminDeletePost: (id) => api.delete(`/admin/posts/${id}`),
};

// ==================== SUBSCRIPTION API ====================

export const subscriptionAPI = {
  // Subscribe to channel
  subscribe: () => api.post('/subscribe'),
  
  // Unsubscribe from channel
  unsubscribe: () => api.post('/unsubscribe'),
  
  // Get subscription status
  getStatus: () => api.get('/subscription/status'),
  
  // Upgrade subscription
  upgrade: (data) => api.post('/subscription/upgrade', data),
  
  // Admin - Get subscription stats
  adminGetStats: () => api.get('/admin/subscription-stats'),
};

// ==================== ORDER API ====================

export const orderAPI = {
  // Create new order
  createOrder: (formData) => 
    api.post('/orders', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  // Get order by order number
  getOrder: (orderNumber) => api.get(`/orders/${orderNumber}`),
  
  // Admin - Get all orders
  adminGetOrders: (params = {}) => api.get('/admin/orders', { params }),
  
  // Admin - Get single order
  adminGetOrder: (id) => api.get(`/admin/orders/${id}`),
  
  // Admin - Update order status
  adminUpdateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),
};

// ==================== UTILITY FUNCTIONS ====================

export const uploadFile = async (file, type = 'image') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const healthCheck = () => api.get('/health');

export default api;