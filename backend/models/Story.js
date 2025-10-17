const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StorySchema = new Schema({
  user:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title:      { type: String, required: true },
  hints:      { type: String },
  genres:     { type: [String], default: [] },
  content:    { type: String }, // generated story text
}, { timestamps: true });

module.exports = mongoose.model('Story', StorySchema);
