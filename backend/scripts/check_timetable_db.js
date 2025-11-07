const mongoose = require('mongoose');
require('dotenv').config();
const Timetable = require('../models/Timetable');

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/school_management';
  console.log('Connecting to', uri);
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const entries = await Timetable.find()
    .populate('teacher', 'username fullName email')
    .populate('section', 'name gradeLevel academicYear')
    .lean();

  console.log(`Found ${entries.length} timetable entr${entries.length === 1 ? 'y' : 'ies'}:`);
  entries.forEach((e, i) => {
    console.log(`\n[${i + 1}] id: ${e._id}`);
    console.log(`  section: ${e.section ? e.section.name + ' (' + e.section._id + ')' : e.section}`);
    console.log(`  teacher: ${e.teacher ? (e.teacher.fullName || e.teacher.username) + ' (' + e.teacher._id + ')' : e.teacher}`);
    console.log(`  subject: ${e.subject}`);
    console.log(`  dayOfWeek: ${e.dayOfWeek}`);
    console.log(`  startTime: ${e.startTime}  endTime: ${e.endTime}`);
    if (e.room) console.log(`  room: ${e.room}`);
    if (e.color) console.log(`  color: ${e.color}`);
  });

  await mongoose.disconnect();
  console.log('\nDisconnected');
}

main().catch(err => { console.error('Error:', err); process.exit(1); });
