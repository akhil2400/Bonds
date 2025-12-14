import api from './api';

export const timelineService = {
  async getTimelines() {
    try {
      const response = await api.get('/timeline');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getUserTimelines() {
    try {
      const response = await api.get('/timeline/my');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createTimeline(timelineData) {
    try {
      const response = await api.post('/timeline', timelineData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};