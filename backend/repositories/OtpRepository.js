const Otp = require('../models/OTP');

class OtpRepository {
  // Create new OTP record
  async create(otpData) {
    const otp = new Otp(otpData);
    return await otp.save();
  }

  // Find OTP by email (latest non-used)
  async findByEmail(email) {
    return await Otp.findOne({
      email: email.toLowerCase(),
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
  }

  // Find OTP by ID
  async findById(id) {
    return await Otp.findById(id);
  }

  // Update OTP
  async update(id, updateData) {
    return await Otp.findByIdAndUpdate(id, updateData, { new: true });
  }

  // Delete OTP by email
  async deleteByEmail(email) {
    return await Otp.deleteMany({ email: email.toLowerCase() });
  }

  // Delete OTP by ID
  async deleteById(id) {
    return await Otp.findByIdAndDelete(id);
  }

  // Count active OTPs for email (rate limiting)
  async countActiveByEmail(email, timeWindow = 5) {
    const since = new Date(Date.now() - timeWindow * 60 * 1000);
    return await Otp.countDocuments({
      email: email.toLowerCase(),
      createdAt: { $gte: since }
    });
  }

  // Clean expired OTPs
  async cleanExpired() {
    return await Otp.cleanExpired();
  }

  // Get OTP statistics
  async getStats() {
    return await Otp.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          used: { $sum: { $cond: ['$isUsed', 1, 0] } },
          expired: { 
            $sum: { 
              $cond: [
                { $lt: ['$expiresAt', new Date()] }, 
                1, 
                0
              ] 
            } 
          },
          active: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$isUsed', false] },
                    { $gt: ['$expiresAt', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);
  }
}

module.exports = new OtpRepository();