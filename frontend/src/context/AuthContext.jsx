import { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload, loading: false };
    case 'CLEAR_USER':
      return { ...state, user: null, isAuthenticated: false, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication on app load only if we have a token
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      checkAuthStatus();
    } else {
      // No token, set loading to false immediately
      dispatch({ type: 'CLEAR_USER' });
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Check if we have a token first
      const token = localStorage.getItem('authToken');
      if (!token) {
        dispatch({ type: 'CLEAR_USER' });
        return;
      }
      
      const response = await authService.checkAuth();
      dispatch({ type: 'SET_USER', payload: response.user });
    } catch (error) {
      console.log('Auth check failed:', error.message);
      
      // Only clear auth if it's a real authentication error (401)
      // Don't clear on network errors or other issues
      if (error.status === 401) {
        console.log('Token expired or invalid, clearing auth');
        localStorage.removeItem('authToken');
        dispatch({ type: 'CLEAR_USER' });
      } else {
        // For network errors, just stop loading but keep user if we had one
        console.log('Network or other error, keeping current auth state');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authService.login(credentials);
      
      // Store token in localStorage as fallback for mobile
      if (response.token) {
        localStorage.setItem('authToken', response.token);
      }
      
      dispatch({ type: 'SET_USER', payload: response.user });
      return response;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const register = async (userData, token = null) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // If we have a token (from OTP verification), store it
      if (token) {
        localStorage.setItem('authToken', token);
      }
      
      // For the new OTP flow, userData will be the user object from verification
      dispatch({ type: 'SET_USER', payload: userData });
      return { user: userData };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      // Clear token from localStorage
      localStorage.removeItem('authToken');
      dispatch({ type: 'CLEAR_USER' });
    } catch (error) {
      // Even if logout fails, clear user locally
      localStorage.removeItem('authToken');
      dispatch({ type: 'CLEAR_USER' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};