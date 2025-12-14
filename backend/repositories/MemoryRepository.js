const Memory = require('../models/Memory');

class MemoryRepository {
  async create(data) {
    return await Memory.create(data);
  }

  async findById(id) {
    return await Memory.findById(id).populate('owner', 'name email');
  }

  async findAll(filter = {}) {
    return await Memory.find(filter).populate('owner', 'name email').sort({ createdAt: -1 });
  }

  async findByOwner(ownerId) {
    return await Memory.find({ owner: ownerId }).populate('owner', 'name email').sort({ createdAt: -1 });
  }

  async update(id, data) {
    return await Memory.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate('owner', 'name email');
  }

  async delete(id) {
    return await Memory.findByIdAndDelete(id);
  }
}

module.exports = new MemoryRepository();