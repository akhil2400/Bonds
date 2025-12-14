const Thought = require('../models/Thought');

class ThoughtRepository {
  async create(data) {
    return await Thought.create(data);
  }

  async findById(id) {
    return await Thought.findById(id).populate('owner', 'name email');
  }

  async findAll(filter = {}) {
    return await Thought.find(filter).populate('owner', 'name email').sort({ createdAt: -1 });
  }

  async findByOwner(ownerId) {
    return await Thought.find({ owner: ownerId }).populate('owner', 'name email').sort({ createdAt: -1 });
  }

  async update(id, data) {
    return await Thought.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate('owner', 'name email');
  }

  async delete(id) {
    return await Thought.findByIdAndDelete(id);
  }
}

module.exports = new ThoughtRepository();