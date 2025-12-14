const MemoryService = require('../services/MemoryService');

class MemoryController {
  async createMemory(req, res, next) {
    try {
      const userId = req.user.id;
      const memoryData = req.body;

      const memory = await MemoryService.createMemory(userId, memoryData);

      res.status(201).json({
        success: true,
        message: 'Memory created successfully',
        memory
      });
    } catch (error) {
      next(error);
    }
  }

  async getMemory(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const memory = await MemoryService.getMemoryById(id, userId);

      res.status(200).json({
        success: true,
        memory
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserMemories(req, res, next) {
    try {
      const userId = req.user.id;

      const memories = await MemoryService.getUserMemories(userId);

      res.status(200).json({
        success: true,
        count: memories.length,
        memories
      });
    } catch (error) {
      next(error);
    }
  }
  async getAllMemories(req, res, next) {
    try {
      const userId = req.user.id;

      const memories = await MemoryService.getAllMemories(userId);

      res.status(200).json({
        success: true,
        count: memories.length,
        memories
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMemory(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      const memory = await MemoryService.updateMemory(id, userId, updateData);

      res.status(200).json({
        success: true,
        message: 'Memory updated successfully',
        memory
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteMemory(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await MemoryService.deleteMemory(id, userId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MemoryController();