import api from './api';

export const memoryService = {
  async getMemories() {
    try {
      const response = await api.get('/memory');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getUserMemories() {
    try {
      const response = await api.get('/memory/my');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createMemory(memoryData) {
    try {
      const response = await api.post('/memory', memoryData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createMemoryWithImages(formData) {
    try {
      const response = await api.post('/memory', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createMemoryWithMedia(formData) {
    try {
      const response = await api.post('/memory', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async uploadImages(formData) {
    try {
      const response = await api.post('/memory/upload-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async uploadMedia(formData) {
    try {
      const response = await api.post('/memory/upload-media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateMemory(id, memoryData) {
    try {
      const response = await api.put(`/memory/${id}`, memoryData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteMemory(id) {
    try {
      const response = await api.delete(`/memory/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};