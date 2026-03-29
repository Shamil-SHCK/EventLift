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

// Feature: Apply for gig work
export const applyForGig = (gigId, linkedInProfile, bidAmount) => {
    return request(`/gigs/${gigId}/apply`, {
        method: 'PUT',
        body: JSON.stringify({ linkedInProfile, bidAmount })
    });
};

// Feature: Assign gig to applicant
export const assignGig = (gigId, applicantId) => {
    return request(`/gigs/${gigId}/assign`, {
        method: 'PUT',
        body: JSON.stringify({ applicantId })
    });
};

// Feature: Get Club's accepted gigs
export const getAcceptedGigs = () => {
    return request('/gigs/accepted', { method: 'GET' });
};

// Feature: Mark gig as complete
export const markGigComplete = (gigId) => {
    return request(`/gigs/${gigId}/complete`, { method: 'PUT' });
};

// Feature: Submit work for review
export const submitWork = (gigId, formData) => {
    // Note: formData should be FormData object to support files
    return request(`/gigs/${gigId}/submit-work`, {
        method: 'PUT',
        body: formData
    });
};

// Feature: Review submitted work
export const reviewWork = (gigId, decision, comment) => {
    return request(`/gigs/${gigId}/review`, {
        method: 'PUT',
        body: JSON.stringify({ decision, comment })
    });
};
