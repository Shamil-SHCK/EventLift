import { request } from './core';

// Create new event
export const createEvent = (eventData) => {
    return request('/events', {
        method: 'POST',
        body: eventData, // Can be FormData
    });
};

// Get all events
export const getEvents = () => {
    return request('/events', {
        method: 'GET',
    });
};

// Get single event
export const getEventById = (id) => {
    return request(`/events/${id}`, {
        method: 'GET',
    });
};

// Update event
export const updateEvent = (id, eventData) => {
    return request(`/events/${id}`, {
        method: 'PUT',
        body: eventData, // Can be FormData
    });
};

// Sponsor event
export const sponsorEvent = (id, amount) => {
    return request(`/events/${id}/sponsor`, {
        method: 'POST',
        body: { amount },
    });
};

// Delete event
export const deleteEvent = (id) => {
    return request(`/events/${id}`, {
        method: 'DELETE',
    });
};
