import axios from 'axios';

/**
 * Axios instance for API requests.
 * Uses the VITE_API_BASE_URL from environment variables.
 */
const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
	timeout: 30000,
	headers: {
		Accept: 'application/json'
	}
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

export default axiosInstance;
