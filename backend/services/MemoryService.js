const MemoryRepository = require('../repositories/MemoryRepository');
const CustomError = require('../errors/CustomError');

class MemoryService {
  async createMemory(userId, memoryData) {
    const { title, description, media, isPrivate } = memoryData;

    const memory = await MemoryRepository.create({
      title,
      description,
      media: media || [],
      owner: userId,
      isPrivate: isPrivate !== undefined ? isPrivate : true
    });

    return memory;
  }

  async getMemoryById(memoryId, userId) {
    const memory = await MemoryRepository.findById(memoryId);
    
    if (!memory) {
      throw new CustomError('Memory not found', 404);
    }

    // Check if user can access this memory
    if (memory.isPrivate && memory.owner._id.toString() !== userId) {
      throw new CustomError('Access denied', 403);
    }

    return memory;
  }

  async getUserMemories(userId) {
    return await MemoryRepository.findByOwner(userId);
  }

  async getAllMemories(userId) {
    // Return public memories and user's own memories
    const filter = {
      $or: [
        { isPrivate: false },
        { owner: userId }
      ]
    };
    
    return await MemoryRepository.findAll(filter);
  }
  async updateMemory(memoryId, userId, updateData) {
    const memory = await MemoryRepository.findById(memoryId);
    
    if (!memory) {
      throw new CustomError('Memory not found', 404);
    }

    // Validate ownership
    if (memory.owner._id.toString() !== userId) {
      throw new CustomError('Access denied. You can only update your own memories', 403);
    }

    const updatedMemory = await MemoryRepository.update(memoryId, updateData);
    return updatedMemory;
  }

  async deleteMemory(memoryId, userId) {
    const memory = await MemoryRepository.findById(memoryId);
    
    if (!memory) {
      throw new CustomError('Memory not found', 404);
    }

    // Validate ownership
    if (memory.owner._id.toString() !== userId) {
      throw new CustomError('Access denied. You can only delete your own memories', 403);
    }

    await MemoryRepository.delete(memoryId);
    return { message: 'Memory deleted successfully' };
  }
}

module.exports = new MemoryService();