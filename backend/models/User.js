const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  mobile: {
    type: String,
    trim: true,
    sparse: true // Allows multiple null values but unique non-null values
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  role: {
    type: String,
    enum: ['admin', 'member'],
    default: 'member'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  verificationMethod: {
    type: String,
    enum: ['email', 'mobile'],
    default: 'email'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);