import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const axiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor for API calls
axiosInstance.interceptors.request.use(
  (config) => {
    // Log requests during development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle global errors here (e.g. 401 unauthorized)
    if (error.response) {
      console.error(`[API Error] ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      console.error('[API Error] No response received from server');
    } else {
      console.error('[API Error]', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Function to set global headers (e.g. Token, Company ID)
 */
export const setGlobalHeaders = (headers: Record<string, string>) => {
  Object.keys(headers).forEach((key) => {
    axiosInstance.defaults.headers.common[key] = headers[key];
  });
};

/**
 * Function to remove global headers
 */
export const removeGlobalHeaders = (keys: string[]) => {
  keys.forEach((key) => {
    delete axiosInstance.defaults.headers.common[key];
  });
};

/**
 * Function to get current global headers
 */
export const getGlobalHeaders = (): Record<string, string> => {
  return axiosInstance.defaults.headers.common as Record<string, string>;
};

export default axiosInstance;
