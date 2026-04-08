import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string; name: string; role?: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

// Heartbeat API
export const heartbeatAPI = {
  record: (data: { bpm: number; source?: string; notes?: string }) =>
    api.post('/heartbeat', data),
  
  getHistory: (params?: { limit?: number; startDate?: string; endDate?: string }) =>
    api.get('/heartbeat/history', { params }),
  
  getLatest: () =>
    api.get('/heartbeat/latest'),
  
  getAnalytics: (period: '24h' | '7d' | '30d' = '24h') =>
    api.get('/heartbeat/analytics', { params: { period } }),
};

// Alert API
export const alertAPI = {
  getAlerts: (dismissed?: boolean) =>
    api.get('/alerts', { params: { dismissed } }),
  
  getStats: () =>
    api.get('/alerts/stats'),
  
  dismiss: (alertId: string) =>
    api.put(`/alerts/${alertId}/dismiss`),
  
  getSettings: () =>
    api.get('/alerts/settings'),
  
  updateSettings: (data: {
    minBpm?: number;
    maxBpm?: number;
    criticalMinBpm?: number;
    criticalMaxBpm?: number;
    emailEnabled?: boolean;
  }) =>
    api.put('/alerts/settings', data),
};

// Patient API
export const patientAPI = {
  getPatients: () =>
    api.get('/patients'),
  
  getPatient: (patientId: string) =>
    api.get(`/patients/${patientId}`),
  
  getDashboard: (patientId: string) =>
    api.get(`/patients/${patientId}/dashboard`),
};

// Health API
export const healthAPI = {
  getProfile: () =>
    api.get('/health/profile'),
  
  updateProfile: (data: {
    age: number;
    gender: string;
    hypertension: boolean;
    heartDisease: boolean;
    bmi?: number;
    avgGlucoseLevel?: number;
    smokingStatus?: string;
  }) =>
    api.post('/health/profile', data),
  
  assessRisk: () =>
    api.post('/health/assess-risk'),
};

export default api;
