const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const resetAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/school_management', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        // Drop the users collection
        await mongoose.connection.collection('users').drop();
        console.log('Users collection dropped');

        // Create admin user
        const adminUser = new User({
            username: 'admin',
            password: 'admin123',
            email: 'admin@school.com',
            role: 'admin',
            fullName: 'System Administrator'
        });

        await adminUser.save();
        console.log('Admin user created successfully');
        console.log('Username: admin');
        console.log('Password: admin123');
        
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error resetting admin user:', error);
        process.exit(1);
    }
};

resetAdmin();