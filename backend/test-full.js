const mongoose = require('mongoose');
const fetch = require('node-fetch');
const User = require('./models/User');
require('dotenv').config();

const testConnection = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/school_management');
        console.log('Connected to MongoDB');

        // Check for admin user
        const adminUser = await User.findOne({ username: 'admin' });
        console.log('Admin user found:', adminUser ? 'yes' : 'no');
        if (adminUser) {
            console.log('Admin user details:', {
                username: adminUser.username,
                email: adminUser.email,
                role: adminUser.role
            });
        }

        // Test login
        console.log('\nTesting login...');
        const response = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });
        
        const data = await response.json();
        console.log('Login response:', data);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

testConnection();