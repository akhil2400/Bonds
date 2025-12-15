const User = require('../models/User');
const { withDatabaseErrorHandling } = require('../middlewares/databaseCheck');

class AuthRepository {
  async findByEmail(email) {
    return await withDatabaseErrorHandling(() => User.findOne({ email }))();
  }

  async findByMobile(mobile) {
    return await withDatabaseErrorHandling(() => User.findOne({ mobile }))();
  }

  async findById(id) {
    return await withDatabaseErrorHandling(() => User.findById(id))();
  }

  async findAll() {
    return await withDatabaseErrorHandling(() => User.find({}).select('-password').sort({ createdAt: -1 }))();
  }

  async createUser(data) {
    return await withDatabaseErrorHandling(() => User.create(data))();
  }

  async updateById(id, data) {
    return await withDatabaseErrorHandling(() => User.findByIdAndUpdate(id, data, { new: true }).select('-password'))();
  }

  async deleteById(id) {
    return await withDatabaseErrorHandling(() => User.findByIdAndDelete(id))();
  }

  async findTrustedMembers() {
    return await withDatabaseErrorHandling(() => User.find({ isTrustedMember: true }).select('-password'))();
  }

  async countByRole(role) {
    return await withDatabaseErrorHandling(() => User.countDocuments({ role }))();
  }
}

module.exports = new AuthRepository();