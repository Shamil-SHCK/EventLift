import { request } from './core';

// Backlog: Publish gig work
export const postGig = (gigData) => {
    return request('/gigs', {
        method: 'POST',
        body: gigData,
    });
};

// Backlog: View available gig works 
export const getOpenGigs = (filters) => {
    // Construct query string from filters object
    const params = new URLSearchParams();
    if (filters) {
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                params.append(key, filters[key]);
            }
        });
    }
    const queryString = params.toString() ? `?${params.toString()}` : '';

    return request(`/gigs${queryString}`, { method: 'GET' });
};

// Feature: Get Company's posted gigs
export const getMyGigs = () => {
    return request('/gigs/my-gigs', { method: 'GET' });
};

// Backlog: Accept gig work 
export const acceptGig = (gigId) => {
    return request(`/gigs/${gigId}/accept`, { method: 'PUT' });
};
