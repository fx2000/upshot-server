const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const issueSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  project: {
    type: ObjectId,
    ref: 'Project',
    required: true
  },
  creator: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: [{
    type: ObjectId,
    ref: 'User'
  }],
  priority: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High', 'Critical']
  },
  status: {
    type: String,
    default: 'Open',
    enum: ['Open', 'Closed', 'Re-Opened']
  },
  followers: [{
    type: ObjectId,
    ref: 'User'
  }],
  comments: [{
    type: ObjectId,
    ref: 'Comment'
  }],
  attachments: [{
    type: String
  }],
  deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

issueSchema.index({
  title: 'text',
  content: 'text'
});

const Issue = mongoose.model('Issue', issueSchema);
module.exports = Issue;
