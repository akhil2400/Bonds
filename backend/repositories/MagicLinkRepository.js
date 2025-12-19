const MagicLink = require('../models/MagicLink');

class MagicLinkRepository {
  // Create a new magic link
  async create(magicLinkData) {
    const magicLink = new MagicLink(magicLinkData);
    return await magicLink.save();
  }

  // Find magic link by token hash
  async findByTokenHash(tokenHash) {
    return await MagicLink.findValidToken(tokenHash);
  }

  // Find magic links by email (for rate limiting)
  async findByEmail(email, minutesBack = 5) {
    const timeThreshold = new Date(Date.now() - minutesBack * 60 * 1000);
    
    // If email is empty, return all active links (for token verification)
    if (!email) {
      return await MagicLink.find({
        isUsed: false,
        expiresAt: { $gt: new Date() }
      }).sort({ createdAt: -1 });
    }
    
    return await MagicLink.find({
      email: email.toLowerCase(),
      createdAt: { $gte: timeThreshold }
    }).sort({ createdAt: -1 });
  }

  // Count active magic links by email (for rate limiting)
  async countActiveByEmail(email, minutesBack = 5) {
    const timeThreshold = new Date(Date.now() - minutesBack * 60 * 1000);
    return await MagicLink.countDocuments({
      email: email.toLowerCase(),
      createdAt: { $gte: timeThreshold }
    });
  }

  // Delete magic links by email (cleanup before creating new one)
  async deleteByEmail(email) {
    return await MagicLink.deleteMany({ 
      email: email.toLowerCase() 
    });
  }

  // Delete magic link by ID
  async deleteById(id) {
    return await MagicLink.findByIdAndDelete(id);
  }

  // Clean expired magic links
  async cleanExpired() {
    return await MagicLink.cleanExpired();
  }

  // Get statistics
  async getStats() {
    return await MagicLink.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          used: {
            $sum: {
              $cond: [{ $eq: ['$isUsed', true] }, 1, 0]
            }
          },
          expired: {
            $sum: {
              $cond: [{ $lt: ['$expiresAt', new Date()] }, 1, 0]
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

  // Find magic link by email and type (latest)
  async findLatestByEmailAndType(email, type) {
    return await MagicLink.findOne({
      email: email.toLowerCase(),
      type,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
  }
}

module.exports = new MagicLinkRepository();