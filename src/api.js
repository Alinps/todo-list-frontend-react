import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  // Only attach token if it exists AND endpoint needs authentication
  const publicEndpoints = ['register/', 'login/'];
  const isPublic = publicEndpoints.some(endpoint => config.url.includes(endpoint));

  if (token && !isPublic) {
    config.headers.Authorization = `Token ${token}`;
  }

  return config;
});

export const logEvent = async (action, meta = {}) => {
  try {
    await api.post('log-event/', { action, meta });
  } catch (e) {
    // Non-blocking: don’t kill UX if logging fails
    console.warn('logEvent failed:', e?.response?.data || e.message);
  }
};

export default api;
