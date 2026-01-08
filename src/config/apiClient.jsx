import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Log API URL for debugging (only in development)
if (import.meta.env.DEV) {
  console.log('🔗 API URL:', API_URL || '❌ NOT SET');
  if (!API_URL) {
    console.error('❌ בעיה: VITE_API_URL לא מוגדר! בדוק את קובץ .env');
  }
}

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor to automatically add token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log server connection errors
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.error('❌ בעיה עם ה-server: זמן החיבור פג - השרת לא מגיב');
    } else if (error.request && !error.response) {
      console.error('❌ בעיה עם ה-server: אין תגובה מהשרת');
      console.error('API URL:', API_URL);
      console.error('Error details:', error.message);
    }
    
    // Only clear data and redirect on specific 403 errors (like token expired)
    // Don't clear data for other 403 errors (like permission denied)
    if (error.response?.status === 403 && error.response?.data?.message?.includes('token')) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient; 