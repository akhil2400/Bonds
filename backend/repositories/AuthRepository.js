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

  async createUser(data) {
    return await User.create(data);
  }
}

module.exports = new AuthRepository();