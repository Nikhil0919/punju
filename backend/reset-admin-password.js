const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const resetAdmin = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/school_management');
        console.log('Connected to MongoDB');

        // Delete existing admin
        console.log('Removing existing admin account...');
        await User.deleteOne({ role: 'admin' });

        // Create new admin user
        console.log('Creating new admin account...');
        const adminUser = new User({
            username: 'admin',
            password: 'admin@123', // This will be hashed automatically
            email: 'admin@school.com',
            role: 'admin',
            fullName: 'System Administrator'
        });

        await adminUser.save();
        console.log('New admin account created successfully');
        console.log('Username: admin');
        console.log('Password: admin@123');

    } catch (error) {
        console.error('Error resetting admin:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

resetAdmin();