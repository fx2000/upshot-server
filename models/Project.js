const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const projectSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  image: {
    type: String,
    default: 'https://res.cloudinary.com/fx2000/image/upload/v1573725101/upshot/project-placeholder.png'
  },
  creator: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  issues: [{
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

projectSchema.index({
  name: 'text',
  description: 'text'
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
