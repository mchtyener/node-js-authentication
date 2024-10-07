const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema({
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '1h' },
});

const tokenBlacklist = mongoose.model('TokenBlacklist', tokenBlacklistSchema);

module.exports = tokenBlacklist;
