import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

// Admin API calls
export const createUser = async (userData) => {
  const response = await api.post('/admin/users', userData);
  return response.data;
};

export const getUsersByRole = async (role) => {
  const response = await api.get(`/admin/users/${role}`);
  return response.data;
};

export const createSection = async (sectionData) => {
  const response = await api.post('/admin/sections', sectionData);
  return response.data;
};

export const getSections = async () => {
  const response = await api.get('/admin/sections');
  return response.data;
};

export const assignStudentsToSection = async (sectionId, studentIds) => {
  const response = await api.post(`/admin/sections/${sectionId}/students`, { studentIds });
  return response.data;
};

export const getSectionStudents = async (sectionId) => {
  const response = await api.get(`/admin/sections/${sectionId}/students`);
  return response.data;
};

export const deleteSection = async (sectionId) => {
  const response = await api.delete(`/admin/sections/${sectionId}`);
  return response.data;
};

export const removeStudentFromSection = async (sectionId, studentId) => {
  const response = await api.delete(`/admin/sections/${sectionId}/students/${studentId}`);
  return response.data;
};

export const getAvailableTeachers = async (sectionId) => {
  const response = await api.get(`/admin/sections/${sectionId}/available-teachers`);
  return response.data;
};

export const assignTeachersToSection = async (sectionId, teacherIds) => {
  const response = await api.post(`/admin/sections/${sectionId}/teachers`, { teacherIds });
  return response.data;
};

export const removeTeacherFromSection = async (sectionId, teacherId) => {
  const response = await api.delete(`/admin/sections/${sectionId}/teachers/${teacherId}`);
  return response.data;
};

export const createTimetableEntry = async (timetableData) => {
  const response = await api.post('/admin/timetable', timetableData);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

export default api;