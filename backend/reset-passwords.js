const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const resetPasswords = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/school_management');
        console.log('Connected to MongoDB\n');

        // Reset teacher password
        const teacher = await User.findOne({ username: 'nikhil' });
        if (teacher) {
            teacher.password = 'teacher123';
            await teacher.save();
            console.log('Reset password for teacher:', teacher.username);
        }

        // Reset student passwords
        const students = await User.find({ role: 'student' });
        for (const student of students) {
            student.password = 'student123';
            await student.save();
            console.log('Reset password for student:', student.username);
        }

        console.log('\nPasswords have been reset:');
        console.log('Teacher (nikhil): teacher123');
        console.log('All students: student123');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

resetPasswords();