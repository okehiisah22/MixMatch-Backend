const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  readTime: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

articleSchema.pre('save', function (next) {
  const WORDS_PER_MINUTE = 200;

  const stripHtml = this.content.replace(/<[^>]*>/g, '');
  const wordCount = stripHtml.split(/\s+/).length;

  this.readTime = Math.ceil(wordCount / WORDS_PER_MINUTE);

  this.updatedAt = Date.now();
  next();
});

const Article = mongoose.model('Blog', articleSchema);
module.exports = Article;
