import api from './axios';

export const loginRequest = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data.data; // { user }
};

export const registerRequest = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data.data; // { user }
};

export const logoutRequest = async () => {
  const response = await api.post('/auth/logout');
  return response.data.data; // { message }
};

export const meRequest = async () => {
  const response = await api.get('/me');
  return response.data.data; // { user }
};