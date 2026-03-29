import { request } from './core';

// Get transaction history
export const getTransactionHistory = () => {
    return request('/transactions', {
        method: 'GET',
    });
};

export const createGigCheckoutSession = (gigId) => {
    return request(`/transactions/gig-checkout/${gigId}`, {
        method: 'POST'
    });
};

export const confirmGigPayment = (sessionId) => {
    return request('/transactions/gig-confirm', {
        method: 'POST',
        body: JSON.stringify({ session_id: sessionId })
    });
};
