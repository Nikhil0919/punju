const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  dayOfWeek: {
    type: Number,
    required: true,
    min: 1,
    max: 5 // Monday to Friday
  },
  startTime: {
    type: String,
    required: true,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:mm format
  },
  endTime: {
    type: String,
    required: true,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:mm format
  },
  room: {
    type: String,
    required: false
  },
  semester: {
    type: String,
    required: false
  },
  color: {
    type: String,
    default: '#3788d8' // Default color for UI
  }
});

module.exports = mongoose.model('Timetable', timetableSchema);