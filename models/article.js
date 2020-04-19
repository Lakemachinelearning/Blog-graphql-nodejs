const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  author: { type: String, required: true },
  date: { type: Date, required: true },
  creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}

});

module.exports = mongoose.model('Article', articleSchema);
