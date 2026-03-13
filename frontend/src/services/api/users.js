import { request } from './core';

// Get all clubs for directory
export const fetchClubsDirectory = () => {
    return request('/users/clubs', { method: 'GET' });
};

export const fetchClubProfile = (id) => {
    return request(`/users/clubs/${id}`, { method: 'GET' });
};

// Get impact gallery events for a specific club
export const fetchClubGallery = (id) => {
    return request(`/users/clubs/${id}/gallery`, { method: 'GET' });
};

// ─── Username System ─────────────────────────────

// Check if a username is available (public, no token needed on server, but
// we still call through core.request which adds Auth if present)
export const checkUsernameAvailability = (username) => {
    return request(`/users/check-username/${encodeURIComponent(username)}`, { method: 'GET' });
};

// Set or update the logged-in user's username
export const setUsername = (username) => {
    return request('/users/set-username', { method: 'PATCH', body: { username } });
};

// Fetch public profile by username (no auth, but still proxied through core)
export const fetchProfileByUsername = (username) => {
    return request(`/profile/${encodeURIComponent(username)}`, { method: 'GET' });
};

// Search users by username
export const searchUsers = (q) => {
    return request(`/users/search?q=${encodeURIComponent(q)}`, { method: 'GET' });
};
