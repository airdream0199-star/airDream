import axios from 'axios';

// Canonical base URL pointing to /api/v1
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL,
  timeout: 15000, // 15 seconds
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor: attach bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extract response body and handle session expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // If token expired or unauthorized on private endpoint, clear auth state
      if (error.response.status === 401 && window.location.pathname.startsWith('/admin')) {
        if (!window.location.pathname.includes('/admin/login')) {
          localStorage.removeItem('token');
          localStorage.removeItem('adminUser');
          window.location.href = '/admin/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
