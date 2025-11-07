import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

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

export const login = async (username: string, password: string) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

// Admin API calls
export const createUser = async (userData: any) => {
  const response = await api.post('/admin/users', userData);
  return response.data;
};

export const getUsersByRole = async (role: string) => {
  const response = await api.get(`/admin/users/${role}`);
  return response.data;
};

export const createSection = async (sectionData: any) => {
  const response = await api.post('/admin/sections', sectionData);
  return response.data;
};

export const getSections = async () => {
  const response = await api.get('/admin/sections');
  return response.data;
};

export const assignStudentsToSection = async (sectionId: string, studentIds: string[]) => {
  const response = await api.post(`/admin/sections/${sectionId}/students`, { studentIds });
  return response.data;
};

export const createTimetableEntry = async (timetableData: any) => {
  const response = await api.post('/timetable', timetableData);
  return response.data;
};

export const deleteUser = async (userId: string) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

export const deleteSection = async (sectionId: string) => {
  const response = await api.delete(`/admin/sections/${sectionId}`);
  return response.data;
};

export default api;