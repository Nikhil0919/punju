const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_management');
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Create admin user
        const adminUser = new User({
            username: 'admin',
            password: 'admin123', // This will be hashed automatically
            email: 'admin@school.com',
            role: 'admin',
            fullName: 'System Administrator'
        });

        await adminUser.save();
        console.log('Admin user created successfully');
        console.log('Username: admin');
        console.log('Password: admin123');
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        mongoose.disconnect();
    }
};

createAdmin();