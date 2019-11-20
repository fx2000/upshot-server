const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const attachmentSchema = new Schema({
  url: {
    type: String,
    required: true,
    unique: true
  },
  uploader: {
    type: ObjectId,
    ref: 'User'
  },
  issue: {
    type: ObjectId,
    ref: 'Issue'
  },
  deleted: {
    type: Boolean,
    default: false
  }
});

const Attachment = mongoose.model('Attachment', attachmentSchema);

module.exports = Attachment;
