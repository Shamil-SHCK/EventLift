import { request } from './core';

// Admin: Get pending users
export const getPendingUsers = () => {
    return request('/admin/users/pending', {
        method: 'GET',
    });
};

// Admin: Get all users
export const getAllUsers = () => {
    return request('/admin/users', {
        method: 'GET',
    });
};

// Admin: Reset User Password
export const resetUserPassword = (userId) => {
    return request(`/admin/users/${userId}/reset-password`, {
        method: 'PUT',
    });
};

// Admin: Verify user
export const verifyUser = (userId, status) => {
    return request(`/admin/verify/${userId}`, {
        method: 'PUT',
        body: { status },
    });
};
