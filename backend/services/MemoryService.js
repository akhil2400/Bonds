const MemoryRepository = require('../repositories/MemoryRepository');
const CustomError = require('../errors/CustomError');
const { deleteMultipleImages } = require('../config/cloudinary');
const { isTrustedMember, TRUSTED_MEMBER_EMAILS } = require('../middlewares/authorization');

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

  async getMemoryById(memoryId, userId, user) {
    const memory = await MemoryRepository.findById(memoryId);
    
    if (!memory) {
      throw new CustomError('Memory not found', 404);
    }

    // Check if user can access this memory
    const userIsTrusted = isTrustedMember(user);
    const ownerIsTrusted = TRUSTED_MEMBER_EMAILS.includes(memory.owner.email?.toLowerCase());
    
    // Access rules:
    // 1. Public memories: everyone can see
    // 2. Private memories: only trusted members can see if created by trusted members
    // 3. Own memories: always accessible
    if (memory.isPrivate) {
      if (memory.owner._id.toString() === userId) {
        // Own memory - always accessible
        return memory;
      } else if (userIsTrusted && ownerIsTrusted) {
        // Trusted member accessing another trusted member's private content - allowed
        return memory;
      } else {
        // Not authorized to view this private memory
        throw new CustomError('Access denied', 403);
      }
    }

    return memory;
  }

  async getUserMemories(userId) {
    return await MemoryRepository.findByOwner(userId);
  }

  async getAllMemories(userId, user) {
    const userIsTrusted = isTrustedMember(user);
    
    if (userIsTrusted) {
      // Trusted members see ALL memories from trusted members + public memories from everyone
      const trustedMemberIds = await this.getTrustedMemberIds();
      
      const filter = {
        $or: [
          { isPrivate: false }, // All public memories
          { owner: { $in: trustedMemberIds } } // All memories (public + private) from trusted members
        ]
      };
      
      return await MemoryRepository.findAll(filter);
    } else {
      // Regular viewers only see public memories
      const filter = { isPrivate: false };
      return await MemoryRepository.findAll(filter);
    }
  }

  async getTrustedMemberIds() {
    // Get user IDs of all trusted members
    const User = require('../models/User');
    const trustedUsers = await User.find({ 
      email: { $in: TRUSTED_MEMBER_EMAILS.map(email => email.toLowerCase()) }
    }).select('_id');
    
    return trustedUsers.map(user => user._id);
  }
  async updateMemory(memoryId, userId, updateData, user) {
    const memory = await MemoryRepository.findById(memoryId);
    
    if (!memory) {
      throw new CustomError('Memory not found', 404);
    }

    const userIsTrusted = isTrustedMember(user);
    const ownerIsTrusted = TRUSTED_MEMBER_EMAILS.includes(memory.owner.email?.toLowerCase());

    // Validate access - trusted members can edit any trusted member's content
    if (memory.owner._id.toString() !== userId) {
      if (!(userIsTrusted && ownerIsTrusted)) {
        throw new CustomError('Access denied. You can only update memories from trusted members', 403);
      }
    }

    const updatedMemory = await MemoryRepository.update(memoryId, updateData);
    return updatedMemory;
  }

  async deleteMemory(memoryId, userId, user) {
    const memory = await MemoryRepository.findById(memoryId);
    
    if (!memory) {
      throw new CustomError('Memory not found', 404);
    }

    const userIsTrusted = isTrustedMember(user);
    const ownerIsTrusted = TRUSTED_MEMBER_EMAILS.includes(memory.owner.email?.toLowerCase());

    // Validate access - trusted members can delete any trusted member's content
    if (memory.owner._id.toString() !== userId) {
      if (!(userIsTrusted && ownerIsTrusted)) {
        throw new CustomError('Access denied. You can only delete memories from trusted members', 403);
      }
    }

    // Delete images from Cloudinary
    if (memory.media && memory.media.length > 0) {
      try {
        const publicIds = memory.media.map(img => img.publicId).filter(Boolean);
        if (publicIds.length > 0) {
          await deleteMultipleImages(publicIds);
        }
      } catch (error) {
        console.error('Error deleting images from Cloudinary:', error);
        // Continue with memory deletion even if image deletion fails
      }
    }

    await MemoryRepository.delete(memoryId);
    return { message: 'Memory deleted successfully' };
  }
}

module.exports = new MemoryService();