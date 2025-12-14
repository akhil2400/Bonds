const Music = require('../models/Music');

class MusicRepository {
  async create(data) {
    return await Music.create(data);
  }

  async findById(id) {
    return await Music.findById(id).populate('owner', 'name email');
  }

  async findAll(filter = {}) {
    return await Music.find(filter).populate('owner', 'name email').sort({ createdAt: -1 });
  }

  async findByOwner(ownerId) {
    return await Music.find({ owner: ownerId }).populate('owner', 'name email').sort({ createdAt: -1 });
  }

  async update(id, data) {
    return await Music.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate('owner', 'name email');
  }

  async delete(id) {
    return await Music.findByIdAndDelete(id);
  }
}

module.exports = new MusicRepository();