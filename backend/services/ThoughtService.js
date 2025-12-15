const ThoughtRepository = require('../repositories/ThoughtRepository');
const CustomError = require('../errors/CustomError');
const { isTrustedMember } = require('../middlewares/authorization');

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

  async getThoughtById(thoughtId, user) {
    const thought = await ThoughtRepository.findById(thoughtId);
    
    if (!thought) {
      throw new CustomError('Thought not found', 404);
    }

    // Trusted members can access all thoughts (public + private from any trusted member)
    // Viewers can only access public thoughts
    if (thought.isPrivate) {
      if (!isTrustedMember(user)) {
        throw new CustomError('Access denied', 403);
      }
    }

    return thought;
  }

  async getUserThoughts(userId) {
    return await ThoughtRepository.findByOwner(userId);
  }

  async getAllThoughts(user) {
    // Trusted members can see all thoughts (public + private from any trusted member)
    // Viewers can only see public thoughts
    if (isTrustedMember(user)) {
      // Trusted members see everything
      return await ThoughtRepository.findAll({});
    } else {
      // Viewers only see public thoughts
      return await ThoughtRepository.findAll({ isPrivate: false });
    }
  }
  async updateThought(thoughtId, user, updateData) {
    const thought = await ThoughtRepository.findById(thoughtId);
    
    if (!thought) {
      throw new CustomError('Thought not found', 404);
    }

    // Only trusted members can update thoughts (shared ownership model)
    if (!isTrustedMember(user)) {
      throw new CustomError('Access denied. Only trusted members can update thoughts', 403);
    }

    const updatedThought = await ThoughtRepository.update(thoughtId, updateData);
    return updatedThought;
  }

  async deleteThought(thoughtId, user) {
    const thought = await ThoughtRepository.findById(thoughtId);
    
    if (!thought) {
      throw new CustomError('Thought not found', 404);
    }

    // Only trusted members can delete thoughts (shared ownership model)
    if (!isTrustedMember(user)) {
      throw new CustomError('Access denied. Only trusted members can delete thoughts', 403);
    }

    await ThoughtRepository.delete(thoughtId);
    return { message: 'Thought deleted successfully' };
  }
}

module.exports = new ThoughtService();