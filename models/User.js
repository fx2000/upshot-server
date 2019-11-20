const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  avatar: {
    type: String,
    default: 'https://res.cloudinary.com/fx2000/image/upload/v1573725101/upshot/user-placeholder.png'
  },
  issues: [{
    type: ObjectId,
    ref: 'Issue'
  }],
  projects: [{
    type: ObjectId,
    ref: 'Project'
  }],
  comments: [{
    type: ObjectId,
    ref: 'Comment'
  }],
  following: [{
    type: ObjectId,
    ref: 'Issue'
  }],
  assignedTo: [{
    type: ObjectId,
    ref: 'Issue'
  }],
  deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;
