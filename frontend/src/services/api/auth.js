import { request } from './core';

// Register user
export const registerUser = (userData) => {
    return request('/auth/register', {
        method: 'POST',
        body: userData,
    });
};

// Verify OTP
export const verifyUserOTP = async (data) => {
    const response = await request('/auth/verify-otp', {
        method: 'POST',
        body: data,
    });

    // Save token to localStorage
    if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response));
    }
    return response;
};

// Login user
export const loginUser = async (credentials) => {
    const response = await request('/auth/login', {
        method: 'POST',
        body: credentials,
    });

    // Save token to localStorage
    if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response));
    }
    return response;
};

// Get current user
export const getCurrentUser = () => {
    // Check for token existence before making request to avoid unnecessary 401s
    // although request() helper handles the header, the component might want to know early
    if (!localStorage.getItem('token')) {
        return Promise.reject(new Error('No token found'));
    }
    return request('/auth/me', { method: 'GET' });
};

// Logout user
export const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
};

// Update user profile
export const updateUserProfile = (userData) => {
    return request('/auth/profile', {
        method: 'PUT',
        body: userData,
    });
};

// Change user password
export const changeUserPassword = (passwordData) => {
    return request('/auth/password', {
        method: 'PUT',
        body: passwordData,
    });
};
