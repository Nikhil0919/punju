const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['academic', 'national', 'other'],
    default: 'academic'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
holidaySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Holiday = mongoose.model('Holiday', holidaySchema);

module.exports = Holiday;