const User = require('../models/User');

class AuthRepository {
  async findByEmail(email) {
    return await User.findOne({ email });
  }

  async findByMobile(mobile) {
    return await User.findOne({ mobile });
  }

  async findById(id) {
    return await User.findById(id);
  }

  async findAll() {
    return await User.find({}).select('-password').sort({ createdAt: -1 });
  }

  async createUser(data) {
    return await User.create(data);
  }

  async updateById(id, data) {
    return await User.findByIdAndUpdate(id, data, { new: true }).select('-password');
  }

  async deleteById(id) {
    return await User.findByIdAndDelete(id);
  }

  async findTrustedMembers() {
    return await User.find({ isTrustedMember: true }).select('-password');
  }

  async countByRole(role) {
    return await User.countDocuments({ role });
  }
}

module.exports = new AuthRepository();