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

  // Traditional login with email/password
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Magic Link login (passwordless)
  async magicLinkLogin(email) {
    try {
      console.log('Making API call to magic link login:', { email });
      const response = await api.post('/auth/magic-login', { email });
      console.log('Magic link login API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Magic link login API error:', error);
      throw error;
    }
  },

  // Step 1: Initial signup (sends Magic Link)
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

  // Step 2: Verify Magic Link and create account
  async verifyMagicLink(token) {
    try {
      console.log('Making API call to verify magic link:', { token });
      const response = await api.post('/auth/verify-magic-link', { token });
      console.log('Verify magic link API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Verify magic link API error:', error);
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
  },

  // Forgot password - Step 1: Send reset Magic Link
  async forgotPassword(email) {
    try {
      console.log('Making API call to forgot password:', { email });
      const response = await api.post('/auth/forgot-password', { email });
      console.log('Forgot password API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Forgot password API error:', error);
      throw error;
    }
  },

  // Forgot password - Step 2: Verify reset link
  async verifyResetLink(token) {
    try {
      console.log('Making API call to verify reset link:', { token });
      const response = await api.post('/auth/verify-reset-link', { token });
      console.log('Verify reset link API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Verify reset link API error:', error);
      throw error;
    }
  },

  // Forgot password - Step 3: Reset password with verified token
  async resetPassword(token, newPassword) {
    try {
      console.log('Making API call to reset password:', { token });
      const response = await api.post('/auth/reset-password', { token, newPassword });
      console.log('Reset password API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Reset password API error:', error);
      throw error;
    }
  }
};