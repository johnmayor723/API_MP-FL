// models/UserEmail.js
const mongoose = require('mongoose');

const UserEmailSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, // Store temporarily until verified
  token: String,
  createdAt: { type: Date, default: Date.now, expires: 3600 }, // expires in 1hr
});

module.exports = mongoose.model('UserEmail', UserEmailSchema);
