const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'student', 'teacher']
  },
  fullName: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  if (!password) {
    throw new Error('Password is required for comparison');
  }
  
  try {
    console.log('Comparing passwords for user:', this.username);
    const isMatch = await bcrypt.compare(password, this.password);
    console.log('Password comparison result for user:', this.username, isMatch ? 'matched' : 'did not match');
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw new Error('Error verifying password');
  }
};

module.exports = mongoose.model('User', userSchema);