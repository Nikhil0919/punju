const mongoose = require('mongoose');
const User = require('./models/User');
const Section = require('./models/Section');
const Timetable = require('./models/Timetable');

const testDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_management');
        console.log('Connected to MongoDB');

        // Test User Creation
        const adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            console.log('Admin user not found. Creating one...');
            const newAdmin = new User({
                username: 'admin',
                password: 'admin123',
                email: 'admin@school.com',
                role: 'admin',
                fullName: 'System Administrator'
            });
            await newAdmin.save();
            console.log('Admin user created successfully');
        } else {
            console.log('Admin user exists');
        }

        // Test Section Creation
        const testSection = await Section.findOne({ name: 'Test Section' });
        if (!testSection) {
            console.log('Creating test section...');
            const newSection = new Section({
                name: 'Test Section',
                gradeLevel: 10,
                academicYear: '2025-2026'
            });
            await newSection.save();
            console.log('Test section created successfully');
        }

        // Test User Queries
        const users = await User.find();
        console.log(`Total users in database: ${users.length}`);

        // Test Section Queries
        const sections = await Section.find();
        console.log(`Total sections in database: ${sections.length}`);

        console.log('Database tests completed successfully');
    } catch (error) {
        console.error('Database test error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

testDatabase();