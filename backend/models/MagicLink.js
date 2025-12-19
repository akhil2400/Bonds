const mongoose = require('mongoose');

const magicLinkSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  tokenHash: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // MongoDB TTL for auto-deletion
  },
  isUsed: {
    type: Boolean,
    default: false,
    index: true
  },
  type: {
    type: String,
    enum: ['signup', 'login', 'password_reset'],
    default: 'signup'
  },
  userData: {
    // Store signup data temporarily for signup magic links
    name: String,
    password: String // This will be hashed before storage
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
magicLinkSchema.index({ email: 1, isUsed: 1, expiresAt: 1 });
magicLinkSchema.index({ tokenHash: 1, isUsed: 1 });

// Instance method to check if magic link is valid
magicLinkSchema.methods.isValid = function() {
  return !this.isUsed && this.expiresAt > new Date();
};

// Instance method to mark as used
magicLinkSchema.methods.markAsUsed = async function() {
  this.isUsed = true;
  return await this.save();
};

// Static method to clean expired magic links
magicLinkSchema.statics.cleanExpired = function() {
  return this.deleteMany({ 
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isUsed: true, createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
    ]
  });
};

// Static method to find valid token
magicLinkSchema.statics.findValidToken = function(tokenHash) {
  return this.findOne({
    tokenHash,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  });
};

module.exports = mongoose.model('MagicLink', magicLinkSchema);