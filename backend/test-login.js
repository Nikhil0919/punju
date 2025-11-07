const axios = require('axios');

const testLogin = async (username, password) => {
    try {
        console.log(`\nTesting login for user: ${username}`);
        const response = await axios.post('http://localhost:5001/api/auth/login', {
            username,
            password
        });
        
        console.log('Login successful!');
        console.log('User details:', response.data.user);
        return response.data;
    } catch (error) {
        console.log('Login failed:', error.response?.data?.message || error.message);
        return null;
    }
};

const runTests = async () => {
    // Test teacher login
    console.log('=== Testing Teacher Login ===');
    await testLogin('nikhil', 'teacher123');

    // Test student login
    console.log('\n=== Testing Student Login ===');
    await testLogin('nibba', 'student123');
    await testLogin('Ramu', 'student123');
};

// Make sure the backend server is running first
console.log('Starting login tests...');
runTests();