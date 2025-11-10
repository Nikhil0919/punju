const API_BASE_URL = 'http://localhost:5001';

export const API_ENDPOINTS = {
    // Auth
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    
    // Leave Management
    LEAVES_ALL: `${API_BASE_URL}/api/leaves/all`,
    LEAVES_CREATE: `${API_BASE_URL}/api/leaves`,
    LEAVES_UPDATE: (id) => `${API_BASE_URL}/api/leaves/${id}`,
    
    // Users
    USERS_BY_ROLE: (role) => `${API_BASE_URL}/api/admin/users/${role}`,
    
    // Holiday Management
    HOLIDAYS: `${API_BASE_URL}/api/holidays`,
    
    // Timetable
    TIMETABLE: `${API_BASE_URL}/api/timetable`,
};

export default API_ENDPOINTS;