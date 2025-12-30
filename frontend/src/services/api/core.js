const API_URL = 'http://localhost:5000/api';

/**
 * Core Request Handler
 * @param {string} endpoint - The API endpoint (e.g., '/auth/login')
 * @param {object} options - Fetch options (method, body, headers)
 * @returns {Promise<any>} - The JSON response
 */
export const request = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');

    // Default headers
    const headers = {};

    // Inject Authorization Token if available
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Handle Content-Type
    // If body is FormData, let browser set Content-Type (multipart/form-data)
    // If body is NOT FormData and not null, default to application/json
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    // Merge custom headers
    const config = {
        ...options,
        headers: {
            ...headers,
            ...options.headers,
        },
    };

    // If body is not FormData, ensure it's stringified
    if (options.body && !(options.body instanceof FormData) && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API Request Failed');
        }

        return data;
    } catch (error) {
        throw error; // Re-throw to be caught by components
    }
};
