// Production Connection Test Utility
import API_CONFIG from '../config/api.js';

export const testBackendConnection = async () => {
  try {
    console.log('🔍 Testing backend connection...');
    console.log('📍 Backend URL:', API_CONFIG.BASE_URL);
    
    // Test basic connectivity
    const response = await fetch(API_CONFIG.BASE_URL.replace('/api', '/health'), {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('✅ Backend connection successful');
    console.log('📊 Backend status:', data);
    
    return {
      success: true,
      status: data.status,
      services: data.services,
      timestamp: data.timestamp
    };
    
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

export const testAPIEndpoint = async (endpoint = '/test') => {
  try {
    console.log(`🔍 Testing API endpoint: ${endpoint}`);
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`✅ API endpoint ${endpoint} working`);
    console.log('📊 Response:', data);
    
    return {
      success: true,
      data,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`❌ API endpoint ${endpoint} failed:`, error.message);
    
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Auto-test connection in development
if (API_CONFIG.IS_DEVELOPMENT) {
  // Test connection after a short delay
  setTimeout(() => {
    testBackendConnection();
  }, 2000);
}