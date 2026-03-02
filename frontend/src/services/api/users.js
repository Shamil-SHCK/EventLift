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
