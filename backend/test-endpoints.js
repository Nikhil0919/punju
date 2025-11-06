const testEndpoints = async () => {
    try {
        console.log('Starting endpoint tests...');

        // Admin login
        console.log('\nTesting Admin Login:');
        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });
        const loginData = await loginResponse.json();
        console.log('Login response:', loginData);

        const { token } = await adminLogin.json();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        // Create teacher
        const teacherResponse = await fetch('http://localhost:5000/api/admin/users', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                username: 'teacher1',
                password: 'teacher123',
                email: 'teacher1@school.com',
                role: 'teacher',
                fullName: 'John Smith'
            })
        });
        console.log('Create Teacher Response:', await teacherResponse.json());

        // Create student
        const studentResponse = await fetch('http://localhost:5000/api/admin/users', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                username: 'student1',
                password: 'student123',
                email: 'student1@school.com',
                role: 'student',
                fullName: 'Jane Doe'
            })
        });
        console.log('Create Student Response:', await studentResponse.json());

        // Create section
        const sectionResponse = await fetch('http://localhost:5000/api/admin/sections', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                name: 'Class 10A',
                gradeLevel: 10,
                academicYear: '2025-2026'
            })
        });
        console.log('Create Section Response:', await sectionResponse.json());

        // Get all sections
        const sectionsResponse = await fetch('http://localhost:5000/api/admin/sections', {
            method: 'GET',
            headers
        });
        console.log('Get Sections Response:', await sectionsResponse.json());

    } catch (error) {
        console.error('Test Error:', error);
    }
};

testEndpoints();