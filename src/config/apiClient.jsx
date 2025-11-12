import axios from 'axios';

// Get API URL from environment variable
let API_URL = import.meta.env.VITE_API_URL;

// Auto-detect API URL for network access (development only)
if (import.meta.env.DEV) {
  const hostname = window.location.hostname;
  const isNetworkIP = hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('127.0.0.1');
  
  if (isNetworkIP) {
    // Phone access detected - use network IP for backend
    // Override VITE_API_URL if it's set to localhost
    if (!API_URL || API_URL.includes('localhost') || API_URL.includes('127.0.0.1')) {
      API_URL = `http://${hostname}:3000`;
      console.log('🔗 Auto-detected API URL for network access (phone):', API_URL);
    } else {
      console.log('🔗 Using VITE_API_URL from env:', API_URL);
    }
  } else {
    // Desktop access - use localhost
    if (!API_URL) {
      API_URL = 'http://localhost:3000';
      console.log('🔗 Using default localhost API URL:', API_URL);
    } else {
      console.log('🔗 Using VITE_API_URL from env:', API_URL);
    }
  }
}

// Log API URL for debugging (only in development)
if (import.meta.env.DEV) {
  console.log('🔗 Final API URL:', API_URL || '❌ NOT SET');
  console.log('🌐 Current hostname:', window.location.hostname);
  
  // Additional debug info
  if (API_URL) {
    console.log('✅ API Client initialized with URL:', API_URL);
  } else {
    console.error('❌ API URL is not set! Check VITE_API_URL environment variable.');
  }
}

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout for network requests (increased for mobile networks)
  timeout: 30000, // 30 seconds for slower mobile networks
  // Validate status to handle network errors better
  validateStatus: function (status) {
    return status < 500; // Consider status codes less than 500 as success for retry logic
  },
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