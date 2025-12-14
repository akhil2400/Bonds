const Trip = require('../models/Trip');

class TripRepository {
  async create(data) {
    return await Trip.create(data);
  }

  async findById(id) {
    return await Trip.findById(id).populate('owner', 'name email');
  }

  async findAll(filter = {}) {
    return await Trip.find(filter).populate('owner', 'name email').sort({ createdAt: -1 });
  }

  async findByOwner(ownerId) {
    return await Trip.find({ owner: ownerId }).populate('owner', 'name email').sort({ createdAt: -1 });
  }

  async findPublic() {
    return await Trip.find({ isPublic: true }).populate('owner', 'name email').sort({ createdAt: -1 });
  }

  async update(id, data) {
    return await Trip.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate('owner', 'name email');
  }

  async delete(id) {
    return await Trip.findByIdAndDelete(id);
  }
}

module.exports = new TripRepository();