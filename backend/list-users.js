const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/school_management');
        console.log('Connected to MongoDB\n');

        // List all teachers
        console.log('=== Teachers ===');
        const teachers = await User.find({ role: 'teacher' }).select('-password');
        teachers.forEach(teacher => {
            console.log(`Username: ${teacher.username}`);
            console.log(`Full Name: ${teacher.fullName}`);
            console.log(`Email: ${teacher.email}`);
            console.log('---');
        });

        // List all students
        console.log('\n=== Students ===');
        const students = await User.find({ role: 'student' }).select('-password');
        students.forEach(student => {
            console.log(`Username: ${student.username}`);
            console.log(`Full Name: ${student.fullName}`);
            console.log(`Email: ${student.email}`);
            console.log('---');
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

listUsers();