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
  },

  async updateTrip(id, tripData) {
    try {
      const response = await api.put(`/trip/${id}`, tripData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteTrip(id) {
    try {
      const response = await api.delete(`/trip/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};