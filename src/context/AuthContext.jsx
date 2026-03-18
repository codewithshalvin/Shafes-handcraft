import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, subscriptionAPI } from '../services/api';
import socketService from '../services/socket';

// Initial state
const initialState = {
  user: null,
  admin: null,
  subscription: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  isSubscribed: false,
  token: null,
};

// Action types
const AuthActionTypes = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  ADMIN_LOGIN_SUCCESS: 'ADMIN_LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_SUBSCRIPTION: 'SET_SUBSCRIPTION',
  UPDATE_USER: 'UPDATE_USER',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case AuthActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        subscription: action.payload.subscription,
        token: action.payload.token,
        isAuthenticated: true,
        isAdmin: false,
        isSubscribed: !!action.payload.subscription,
        isLoading: false,
      };

    case AuthActionTypes.ADMIN_LOGIN_SUCCESS:
      return {
        ...state,
        admin: action.payload.admin,
        token: action.payload.token,
        isAuthenticated: true,
        isAdmin: true,
        isLoading: false,
      };

    case AuthActionTypes.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };

    case AuthActionTypes.SET_SUBSCRIPTION:
      return {
        ...state,
        subscription: action.payload,
        isSubscribed: !!action.payload,
      };

    case AuthActionTypes.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const isAdmin = localStorage.getItem('isAdmin') === 'true';

      if (token && user) {
        // Verify token and get fresh user data
        if (isAdmin) {
          dispatch({
            type: AuthActionTypes.ADMIN_LOGIN_SUCCESS,
            payload: { admin: user, token }
          });
        } else {
          // Get user profile and subscription
          const [profileResponse, subscriptionResponse] = await Promise.all([
            authAPI.getProfile(),
            subscriptionAPI.getStatus()
          ]);

          dispatch({
            type: AuthActionTypes.LOGIN_SUCCESS,
            payload: {
              user: profileResponse.data.user,
              subscription: subscriptionResponse.data.subscribed ? subscriptionResponse.data.subscription : null,
              token
            }
          });

          // Connect socket for authenticated users
          socketService.connect();
        }
      } else {
        dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isAdmin');
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
    }
  };

  // User login
  const login = async (credentials) => {
    try {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
      
      const response = await authAPI.login(credentials);
      const { token, user, subscription } = response.data;

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.removeItem('isAdmin');

      // Update state
      dispatch({
        type: AuthActionTypes.LOGIN_SUCCESS,
        payload: { user, subscription, token }
      });

      // Connect socket
      socketService.connect();

      return response.data;
    } catch (error) {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
      throw error;
    }
  };

  // User registration
  const register = async (userData) => {
    try {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
      
      const response = await authAPI.register(userData);
      const { token, user } = response.data;

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.removeItem('isAdmin');

      // Get subscription (auto-created on registration)
      const subscriptionResponse = await subscriptionAPI.getStatus();
      const subscription = subscriptionResponse.data.subscribed ? subscriptionResponse.data.subscription : null;

      // Update state
      dispatch({
        type: AuthActionTypes.LOGIN_SUCCESS,
        payload: { user, subscription, token }
      });

      // Connect socket
      socketService.connect();

      return response.data;
    } catch (error) {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
      throw error;
    }
  };

  // Google OAuth
  const googleLogin = async (credential) => {
    try {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
      
      const response = await authAPI.googleAuth(credential);
      const { token, user, subscription } = response.data;

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.removeItem('isAdmin');

      // Update state
      dispatch({
        type: AuthActionTypes.LOGIN_SUCCESS,
        payload: { user, subscription, token }
      });

      // Connect socket
      socketService.connect();

      return response.data;
    } catch (error) {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
      throw error;
    }
  };

  // Admin login
  const adminLogin = async (credentials) => {
    try {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
      
      const response = await authAPI.adminLogin(credentials);
      const { token, admin } = response.data;

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(admin));
      localStorage.setItem('isAdmin', 'true');

      // Update state
      dispatch({
        type: AuthActionTypes.ADMIN_LOGIN_SUCCESS,
        payload: { admin, token }
      });

      return response.data;
    } catch (error) {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
      throw error;
    }
  };

  // Logout
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');

    // Disconnect socket
    socketService.disconnect();

    // Update state
    dispatch({ type: AuthActionTypes.LOGOUT });
  };

  // Subscribe to channel
  const subscribe = async () => {
    try {
      const response = await subscriptionAPI.subscribe();
      const subscription = response.data.subscription;
      
      dispatch({
        type: AuthActionTypes.SET_SUBSCRIPTION,
        payload: subscription
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Unsubscribe from channel
  const unsubscribe = async () => {
    try {
      await subscriptionAPI.unsubscribe();
      
      dispatch({
        type: AuthActionTypes.SET_SUBSCRIPTION,
        payload: null
      });
    } catch (error) {
      throw error;
    }
  };

  // Update subscription
  const updateSubscription = (subscription) => {
    dispatch({
      type: AuthActionTypes.SET_SUBSCRIPTION,
      payload: subscription
    });
  };

  const value = {
    ...state,
    login,
    register,
    googleLogin,
    adminLogin,
    logout,
    subscribe,
    unsubscribe,
    updateSubscription,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;