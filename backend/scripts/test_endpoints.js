const axios = require('axios');

const api = axios.create({ baseURL: 'http://localhost:5000/api', timeout: 5000 });

async function run() {
  try {
    console.log('\n=== POST /auth/login ===');
    const loginRes = await api.post('/auth/login', { username: 'admin', password: 'admin123' });
    console.log('LOGIN RESPONSE:', JSON.stringify(loginRes.data, null, 2));
    const token = loginRes.data.token;
    if (!token) throw new Error('No token returned from login');

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    console.log('\n=== GET /auth/me ===');
    const me = await api.get('/auth/me');
    console.log('ME:', JSON.stringify(me.data, null, 2));

    console.log('\n=== GET /admin/sections ===');
    let sections = [];
    try {
      const s = await api.get('/admin/sections');
      sections = s.data;
      console.log('SECTIONS:', JSON.stringify(sections, null, 2));
    } catch (err) {
      console.error('GET /admin/sections error:', err.response ? err.response.data : err.message);
    }

    console.log('\n=== GET /assignment ===');
    try {
      const a = await api.get('/assignment');
      console.log('ASSIGNMENT:', JSON.stringify(a.data, null, 2));
    } catch (err) {
      console.error('GET /assignment error:', err.response ? err.response.data : err.message);
    }

    console.log('\n=== CREATE TEACHER (POST /admin/users) ===');
    let teacherId = null;
    try {
      const payload = {
        username: `testteacher${Math.floor(Math.random()*100000)}`,
        password: 'teachpass',
        email: `teach_${Math.floor(Math.random()*100000)}@local.test`,
        role: 'teacher',
        fullName: 'Test Teacher'
      };
      const r = await api.post('/admin/users', payload);
      console.log('CREATE TEACHER RESPONSE:', JSON.stringify(r.data, null, 2));
      teacherId = r.data.userId;
    } catch (err) {
      console.error('CREATE TEACHER error:', err.response ? err.response.data : err.message);
    }

    console.log('\n=== CREATE SECTION (POST /admin/sections) ===');
    let sectionId = null;
    try {
      const payload = { name: `test-section-${Date.now()}`, gradeLevel: '10', academicYear: '2025-2026' };
      const r = await api.post('/admin/sections', payload);
      console.log('CREATE SECTION RESPONSE:', JSON.stringify(r.data, null, 2));
      sectionId = r.data.sectionId;
    } catch (err) {
      console.error('CREATE SECTION error:', err.response ? err.response.data : err.message);
    }

    console.log('\n=== CREATE TIMETABLE (POST /admin/timetable) ===');
    try {
      if (!teacherId || !sectionId) throw new Error('Missing teacherId or sectionId');
      const payload = { sectionId, teacherId, subject: 'Maths', dayOfWeek: 1, startTime: '09:00', endTime: '10:00' };
      const r = await api.post('/admin/timetable', payload);
      console.log('CREATE TIMETABLE RESPONSE:', JSON.stringify(r.data, null, 2));
    } catch (err) {
      console.error('CREATE TIMETABLE error:', err.response ? err.response.data : err.message);
    }

    console.log('\n=== GET /timetable/section/:id ===');
    let timetableEntries = [];
    try {
      const r = await api.get(`/timetable/section/${sectionId}`);
      timetableEntries = r.data;
      console.log('TIMETABLE ENTRIES:', JSON.stringify(timetableEntries, null, 2));
    } catch (err) {
      console.error('GET TIMETABLE error:', err.response ? err.response.data : err.message);
    }

    let ttId = timetableEntries && timetableEntries[0] && timetableEntries[0]._id;

    if (ttId) {
      console.log('\n=== UPDATE /timetable/:id ===');
      try {
        const payload = { section: sectionId, teacher: teacherId, subject: 'Physics', dayOfWeek: 1, startTime: '09:00', endTime: '10:00' };
        const r = await api.put(`/timetable/${ttId}`, payload);
        console.log('UPDATE RESPONSE:', JSON.stringify(r.data, null, 2));
      } catch (err) {
        console.error('UPDATE error:', err.response ? err.response.data : err.message);
      }

      console.log('\n=== DELETE /timetable/:id ===');
      try {
        const r = await api.delete(`/timetable/${ttId}`);
        console.log('DELETE TIMETABLE RESPONSE:', JSON.stringify(r.data, null, 2));
      } catch (err) {
        console.error('DELETE TIMETABLE error:', err.response ? err.response.data : err.message);
      }
    } else {
      console.log('No timetable entry id available to update/delete');
    }

    console.log('\n=== CLEANUP: delete section and teacher if created ===');
    try {
      if (sectionId) { const r = await api.delete(`/admin/sections/${sectionId}`); console.log('DELETE SECTION RESPONSE:', JSON.stringify(r.data, null, 2)); }
    } catch (err) { console.error('DELETE SECTION error:', err.response ? err.response.data : err.message); }

    try {
      if (teacherId) { const r = await api.delete(`/admin/users/${teacherId}`); console.log('DELETE USER RESPONSE:', JSON.stringify(r.data, null, 2)); }
    } catch (err) { console.error('DELETE USER error:', err.response ? err.response.data : err.message); }

    console.log('\n=== END OF TESTS ===');
  } catch (err) {
    console.error('Fatal error during tests:', err);
  }
}

run();
