import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    if (response) {
      // Server responded with error status
      const { status, data } = response;
      
      switch (status) {
        case 401:
          // Unauthorized - only redirect if not on public pages
          if (!window.location.pathname.includes('/login') && 
              !window.location.pathname.includes('/register') && 
              window.location.pathname !== '/') {
            window.location.href = '/login';
          }
          break;
        case 403:
          // Forbidden
          console.error('Access denied:', data.error);
          break;
        case 404:
          // Not found
          console.error('Resource not found:', data.error);
          break;
        case 429:
          // Rate limited
          console.error('Too many requests:', data.error);
          break;
        case 500:
          // Server error
          console.error('Server error:', data.error);
          break;
        case 503:
          // Service unavailable (database down)
          console.error('Database unavailable:', data.error);
          if (data.code === 'DATABASE_UNAVAILABLE') {
            // Show user-friendly message for database issues
            console.log('Database troubleshooting:', data.troubleshooting);
          }
          break;
        default:
          console.error('API Error:', data.error || 'Unknown error');
      }
      
      // Return formatted error
      return Promise.reject({
        message: data.error || 'An error occurred',
        status,
        data
      });
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.message);
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        status: 0
      });
    } else {
      // Request setup error
      console.error('Request error:', error.message);
      return Promise.reject({
        message: 'Request failed',
        status: 0
      });
    }
  }
);

// Export both default and named for compatibility
export default api;
export { api };