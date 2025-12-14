import api from './api';

export const authService = {
  // Check if user is authenticated
  async checkAuth() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Login user
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Step 1: Initial signup (sends OTP)
  async signup(signupData) {
    try {
      console.log('Making API call to signup:', signupData);
      const response = await api.post('/auth/signup', signupData);
      console.log('Signup API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Signup API error:', error);
      throw error;
    }
  },

  // Step 2: Verify OTP and create account
  async verifyOTP(verificationData) {
    try {
      console.log('Making API call to verify OTP:', verificationData);
      const response = await api.post('/auth/verify-otp', verificationData);
      console.log('Verify OTP API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Verify OTP API error:', error);
      throw error;
    }
  },

  // Resend OTP
  async resendOTP(resendData) {
    try {
      console.log('Making API call to resend OTP:', resendData);
      const response = await api.post('/auth/resend-otp', resendData);
      console.log('Resend OTP API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Resend OTP API error:', error);
      throw error;
    }
  },

  // Logout user
  async logout() {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};