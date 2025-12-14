const ThoughtRepository = require('../repositories/ThoughtRepository');
const CustomError = require('../errors/CustomError');

class ThoughtService {
  async createThought(userId, thoughtData) {
    const { title, content, isPrivate } = thoughtData;

    const thought = await ThoughtRepository.create({
      title,
      content,
      owner: userId,
      isPrivate: isPrivate !== undefined ? isPrivate : true
    });

    return thought;
  }

  async getThoughtById(thoughtId, userId) {
    const thought = await ThoughtRepository.findById(thoughtId);
    
    if (!thought) {
      throw new CustomError('Thought not found', 404);
    }

    // Check if user can access this thought
    if (thought.isPrivate && thought.owner._id.toString() !== userId) {
      throw new CustomError('Access denied', 403);
    }

    return thought;
  }

  async getUserThoughts(userId) {
    return await ThoughtRepository.findByOwner(userId);
  }

  async getAllThoughts(userId) {
    // Return public thoughts and user's own thoughts
    const filter = {
      $or: [
        { isPrivate: false },
        { owner: userId }
      ]
    };
    
    return await ThoughtRepository.findAll(filter);
  }
  async updateThought(thoughtId, userId, updateData) {
    const thought = await ThoughtRepository.findById(thoughtId);
    
    if (!thought) {
      throw new CustomError('Thought not found', 404);
    }

    // Validate ownership
    if (thought.owner._id.toString() !== userId) {
      throw new CustomError('Access denied. You can only update your own thoughts', 403);
    }

    const updatedThought = await ThoughtRepository.update(thoughtId, updateData);
    return updatedThought;
  }

  async deleteThought(thoughtId, userId) {
    const thought = await ThoughtRepository.findById(thoughtId);
    
    if (!thought) {
      throw new CustomError('Thought not found', 404);
    }

    // Validate ownership
    if (thought.owner._id.toString() !== userId) {
      throw new CustomError('Access denied. You can only delete your own thoughts', 403);
    }

    await ThoughtRepository.delete(thoughtId);
    return { message: 'Thought deleted successfully' };
  }
}

module.exports = new ThoughtService();