const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const commentSchema = new Schema({
  user: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  issue: {
    type: ObjectId,
    ref: 'Issue',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

commentSchema.index({
  content: 'text'
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
