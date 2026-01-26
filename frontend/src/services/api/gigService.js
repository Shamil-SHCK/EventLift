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

// Feature: Apply for a gig
export const applyForGig = (gigId) => {
    return request(`/gigs/${gigId}/apply`, { method: 'PUT' });
};

// Backlog: Accept gig work 
export const acceptGig = (gigId) => {
    return request(`/gigs/${gigId}/accept`, { method: 'PUT' });
};

// Feature: Get Club's accepted gigs
export const getAcceptedGigs = () => {
    return request('/gigs/accepted', { method: 'GET' });
};

// Feature: Mark gig as complete
export const markGigComplete = (gigId) => {
    return request(`/gigs/${gigId}/complete`, { method: 'PUT' });
};

// Feature: Get Applicants (Company)
export const getGigApplicants = (gigId) => {
    return request(`/gigs/${gigId}/applicants`, { method: 'GET' });
};

// Feature: Manage Applicant (Accept/Reject)
export const manageApplicant = (gigId, applicantId, action) => {
    return request('/gigs/manage-applicant', {
        method: 'POST',
        body: { gigId, applicantId, action }
    });
};
// Feature: Get my (Club's) applications
export const getMyApplications = () => {
    return request('/gigs/my-applications', { method: 'GET' });
};
