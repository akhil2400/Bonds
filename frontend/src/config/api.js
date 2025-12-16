// Production API Configuration
const API_CONFIG = {
  // Base URL for all API requests
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://bonds-backend-rix0.onrender.com/api',
  
  // Request timeout (10 seconds)
  TIMEOUT: 10000,
  
  // Enable credentials for authentication
  WITH_CREDENTIALS: true,
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Environment check
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEVELOPMENT: import.meta.env.DEV,
};

// Validate configuration
if (!API_CONFIG.BASE_URL) {
  console.error('❌ VITE_API_BASE_URL is not configured');
  throw new Error('API base URL is required');
}

// Ensure HTTPS in production
if (API_CONFIG.IS_PRODUCTION && !API_CONFIG.BASE_URL.startsWith('https://')) {
  console.error('❌ Production API must use HTTPS');
  throw new Error('Production API must use HTTPS');
}

// Log configuration (without sensitive data)
console.log('🔧 API Configuration:', {
  baseUrl: API_CONFIG.BASE_URL,
  environment: API_CONFIG.IS_PRODUCTION ? 'production' : 'development',
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
  timeout: API_CONFIG.TIMEOUT
});

export default API_CONFIG;