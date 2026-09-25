/**
 * api.js – Axios instance configured for the BrainTumor API.
 *
 * Features:
 *   - baseURL pointing to FastAPI backend
 *   - Request interceptor: automatically injects JWT token from localStorage
 *   - Response interceptor: handles 401 by auto-logging out
 */

import axios from 'axios';

const TOKEN_KEY = 'braintumor_access_token';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create a pre-configured Axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 second timeout (model inference can be slow)
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── Request Interceptor ────────────────────────────────────────────────────────
// Automatically inject the JWT Bearer token into every request header.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response Interceptor ───────────────────────────────────────────────────────
// If the API returns 401 (Unauthorized), the token has expired or is invalid.
// Automatically clear localStorage and redirect to login.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid – clear auth state and redirect
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem('braintumor_user');
            // Only redirect if not already on the login page
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// ─────────────────────────────────────────────────────────────────────────────
// API Service Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Auth Services
 */
export const authService = {
    /**
     * Register a new user account.
     * @param {Object} data - { username, email, password }
     */
    register: (data) => api.post('/auth/register', data),

    /**
     * Login and receive a JWT token.
     * @param {Object} data - { email, password }
     * @returns TokenResponse: { access_token, user_id, username, email }
     */
    login: (data) => api.post('/auth/login', data),
};

/**
 * Prediction Services
 */
export const predictionService = {
    /**
     * Upload an MRI scan and get a tumor prediction.
     * @param {File} imageFile - The MRI image file
     * @param {Function} onProgress - Optional upload progress callback (0-100)
     */
    predict: (imageFile, onProgress) => {
        const formData = new FormData();
        formData.append('file', imageFile);

        return api.post('/predict', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percent = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onProgress(percent);
                }
            },
        });
    },
};

/**
 * History Services
 */
export const historyService = {
    /**
     * Get the logged-in user's prediction history.
     * @returns HistoryResponse: { total, predictions: [...] }
     */
    getHistory: () => api.get('/history'),
};

export default api;
