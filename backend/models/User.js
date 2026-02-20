const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // FIX: Default role is now 'user' to prevent auto-admin access
  role: { type: String, default: 'user' } 
});

module.exports = mongoose.model('User', UserSchema);