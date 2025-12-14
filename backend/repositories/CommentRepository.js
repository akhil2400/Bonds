const Comment = require('../models/Comment');

class CommentRepository {
  async create(data) {
    return await Comment.create(data);
  }

  async findById(id) {
    return await Comment.findById(id).populate('owner', 'name email');
  }

  async findAll(filter = {}) {
    return await Comment.find(filter).populate('owner', 'name email').sort({ createdAt: -1 });
  }

  async findByParent(parentType, parentId) {
    return await Comment.find({ parentType, parentId }).populate('owner', 'name email').sort({ createdAt: 1 });
  }

  async findByOwner(ownerId) {
    return await Comment.find({ owner: ownerId }).populate('owner', 'name email').sort({ createdAt: -1 });
  }

  async update(id, data) {
    return await Comment.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate('owner', 'name email');
  }

  async delete(id) {
    return await Comment.findByIdAndDelete(id);
  }
}

module.exports = new CommentRepository();