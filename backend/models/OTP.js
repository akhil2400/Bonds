const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  otp: {
    type: String,
    required: true // This will store the hashed OTP
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
  attempts: {
    type: Number,
    default: 0,
    max: 3
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
otpSchema.index({ email: 1, isUsed: 1, expiresAt: 1 });

// Instance method to check if OTP is valid
otpSchema.methods.isValid = function() {
  return !this.isUsed && 
         this.attempts < 3 && 
         this.expiresAt > new Date();
};

// Instance method to increment attempts
otpSchema.methods.incrementAttempts = async function() {
  this.attempts += 1;
  return await this.save();
};

// Instance method to mark as used
otpSchema.methods.markAsUsed = async function() {
  this.isUsed = true;
  return await this.save();
};

// Static method to clean expired OTPs
otpSchema.statics.cleanExpired = function() {
  return this.deleteMany({ 
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isUsed: true, createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
    ]
  });
};

module.exports = mongoose.model('Otp', otpSchema);