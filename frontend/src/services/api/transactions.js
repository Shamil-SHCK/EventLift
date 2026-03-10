import { request } from './core';

// Get transaction history
export const getTransactionHistory = () => {
    return request('/transactions', {
        method: 'GET',
    });
};
