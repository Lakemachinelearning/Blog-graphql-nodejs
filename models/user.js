const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type:String,
    required: true
  },
  password: {
     type: String,
     required: true
  },
  createdArticles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article'
    }
  ]
})

module.exports = mongoose.model('User', userSchema)
