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
    max: 7
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Timetable', timetableSchema);