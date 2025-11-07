const axios = require('axios');

const baseURL = 'http://localhost:5001/api';
let token = '';
let headers = {};
let testSectionId = '';
let testTeacherId = '';

// Add request interceptor to log requests
axios.interceptors.request.use(request => {
  console.log('Request:', {
    method: request.method,
    url: request.url,
    data: request.data,
    headers: request.headers
  });
  return request;
});

// Add response interceptor to log responses
axios.interceptors.response.use(
  response => {
    console.log('Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
);

async function runTests() {
    try {
        // Test 1: Login
        console.log('\n=== Testing Login ===');
        const loginRes = await axios.post(`${baseURL}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        token = loginRes.data.token;
        headers = { Authorization: `Bearer ${token}` };
        console.log('Login successful, token received');

        // Test 2: Create Section
        console.log('\n=== Testing Section Creation ===');
        const sectionRes = await axios.post(`${baseURL}/admin/sections`, {
            name: 'Test Section',
            gradeLevel: 10,
            academicYear: '2025-2026'
        }, { headers });
        testSectionId = sectionRes.data.sectionId;
        console.log('Section created:', sectionRes.data);

        // Test 3: Create Teacher
        console.log('\n=== Testing Teacher Creation ===');
        const teacherRes = await axios.post(`${baseURL}/admin/users`, {
            username: `testteacher${Date.now()}`,
            password: 'teacher123',
            email: `teacher${Date.now()}@test.com`,
            role: 'teacher',
            fullName: 'Test Teacher'
        }, { headers });
        testTeacherId = teacherRes.data.userId;
        console.log('Teacher created:', teacherRes.data);

        // Test 4: Create Timetable Entry
        console.log('\n=== Testing Timetable Creation ===');
        const timetableRes = await axios.post(`${baseURL}/admin/timetable`, {
            sectionId: testSectionId,
            teacherId: testTeacherId,
            subject: 'Mathematics',
            dayOfWeek: 1,
            startTime: '09:00',
            endTime: '10:00'
        }, { headers });
        console.log('Timetable entry created:', timetableRes.data);

        // Test 5: Get Section Timetable
        console.log('\n=== Testing Get Section Timetable ===');
        const getTimetableRes = await axios.get(`${baseURL}/timetable/section/${testSectionId}`, { headers });
        console.log('Section timetable:', getTimetableRes.data);

        console.log('\nAll tests completed successfully!');
    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

runTests();
