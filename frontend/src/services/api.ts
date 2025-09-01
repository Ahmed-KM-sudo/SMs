import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000', // The address of our backend
});

// We can add an interceptor here to automatically add the auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
