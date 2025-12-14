const Timeline = require('../models/Timeline');

class TimelineRepository {
  async create(data) {
    return await Timeline.create(data);
  }

  async findById(id) {
    return await Timeline.findById(id).populate('owner', 'name email');
  }

  async findAll(filter = {}) {
    return await Timeline.find(filter).populate('owner', 'name email').sort({ year: -1 });
  }

  async findByOwner(ownerId) {
    return await Timeline.find({ owner: ownerId }).populate('owner', 'name email').sort({ year: -1 });
  }

  async update(id, data) {
    return await Timeline.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate('owner', 'name email');
  }

  async delete(id) {
    return await Timeline.findByIdAndDelete(id);
  }
}

module.exports = new TimelineRepository();