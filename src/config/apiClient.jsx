import axios from 'axios';

// Get API URL from environment variable
let API_URL = import.meta.env.VITE_API_URL;

// Auto-detect API URL for network access (development only)
if (import.meta.env.DEV && !API_URL) {
  // Detect if running on network IP (phone access)
  const hostname = window.location.hostname;
  const isNetworkIP = hostname !== 'localhost' && hostname !== '127.0.0.1';
  
  if (isNetworkIP) {
    // Auto-use network IP for backend
    API_URL = `http://${hostname}:3000`;
    console.log('🔗 Auto-detected API URL for network access:', API_URL);
  } else {
    // Default to localhost for desktop
    API_URL = 'http://localhost:3000';
    console.log('🔗 Using default localhost API URL:', API_URL);
  }
}

// Log API URL for debugging (only in development)
if (import.meta.env.DEV) {
  console.log('🔗 Final API URL:', API_URL || '❌ NOT SET');
  console.log('🌐 Current hostname:', window.location.hostname);
  
  // Warn if using localhost but accessing from network IP
  const hostname = window.location.hostname;
  const isNetworkIP = hostname !== 'localhost' && hostname !== '127.0.0.1';
  if (isNetworkIP && API_URL && API_URL.includes('localhost')) {
    console.warn('⚠️ WARNING: Running on network IP but API URL is localhost!');
    console.warn('📱 Phone access requires network IP in VITE_API_URL');
    console.warn('💡 Solution: Create .env.local file with: VITE_API_URL=http://' + hostname + ':3000');
    console.warn('💡 Or set: VITE_API_URL=http://192.168.29.73:3000 (replace with your IP)');
  }
}

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout for network requests
  timeout: 10000, // 10 seconds
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

// Add response interceptor to handle token expiration and network errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Enhanced error logging for debugging
    if (import.meta.env.DEV) {
      if (error.request && !error.response) {
        // Network error - no response received
        console.error('❌ Network Error:', {
          message: 'No response received from server',
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          fullURL: error.config?.baseURL + error.config?.url,
          hostname: window.location.hostname,
          suggestion: 'Check if backend is running and accessible from this network'
        });
      } else if (error.response) {
        // Server responded with error status
        console.error('❌ API Error:', {
          status: error.response.status,
          message: error.response.data?.message,
          url: error.config?.url
        });
      }
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