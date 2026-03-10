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

// Create Stripe Checkout Session
export const createCheckoutSession = (id, amount) => {
    return request(`/events/${id}/create-checkout-session`, {
        method: 'POST',
        body: { amount },
    });
};

// Confirm sponsorship
export const confirmSponsorship = (sessionId) => {
    return request(`/events/sponsor/confirm`, {
        method: 'POST',
        body: { session_id: sessionId },
    });
};

// Cancel sponsorship
export const cancelSponsorship = (sessionId) => {
    return request(`/events/sponsor/cancel`, {
        method: 'POST',
        body: { session_id: sessionId },
    });
};

// Delete event
export const deleteEvent = (id) => {
    return request(`/events/${id}`, {
        method: 'DELETE',
    });
};
