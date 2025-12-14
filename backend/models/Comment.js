const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required']
  },
  parentType: {
    type: String,
    enum: ['Memory', 'Thought', 'Trip', 'Music'],
    required: [true, 'Parent type is required']
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Parent ID is required']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Comment', commentSchema);