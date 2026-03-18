import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  // Initialize socket connection
  connect() {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      this.isConnected = false;
    });

    return this.socket;
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('Socket disconnected manually');
    }
  }

  // Join a post room for real-time updates
  joinPost(postId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-post', postId);
    }
  }

  // Leave a post room
  leavePost(postId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-post', postId);
    }
  }

  // Emit like event
  emitLike(postId, userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('like-post', { postId, userId });
    }
  }

  // Emit new comment event
  emitComment(postId, comment) {
    if (this.socket && this.isConnected) {
      this.socket.emit('new-comment', { postId, comment });
    }
  }

  // Listen for real-time like updates
  onPostLiked(callback) {
    if (this.socket) {
      this.socket.on('post-liked', callback);
    }
  }

  // Listen for real-time comment updates
  onCommentAdded(callback) {
    if (this.socket) {
      this.socket.on('comment-added', callback);
    }
  }

  // Remove listeners
  offPostLiked(callback) {
    if (this.socket) {
      this.socket.off('post-liked', callback);
    }
  }

  offCommentAdded(callback) {
    if (this.socket) {
      this.socket.off('comment-added', callback);
    }
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }

  // Check connection status
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;