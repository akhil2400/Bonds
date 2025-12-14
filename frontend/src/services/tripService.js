import api from './api';

export const tripService = {
  async getTrips() {
    try {
      const response = await api.get('/trip');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getPublicTrips() {
    try {
      const response = await api.get('/trip/public');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getUserTrips() {
    try {
      const response = await api.get('/trip/my');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createTrip(tripData) {
    try {
      const response = await api.post('/trip', tripData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};