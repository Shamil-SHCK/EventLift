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

// Admin: Get club transactions
export const getClubTransactions = () => {
    return request('/admin/club-transactions', {
        method: 'GET',
    });
};

// Admin: Mark transaction completed
export const completeTransaction = (id) => {
    return request(`/admin/transactions/${id}/complete`, {
        method: 'PUT',
    });
};

// Admin: Upload transfer proof image and mark transaction completed
export const uploadTransferProof = (id, file) => {
    const formData = new FormData();
    formData.append('proof', file);
    return request(`/admin/transactions/${id}/proof`, {
        method: 'PUT',
        body: formData,
    });
};

// Admin: Get Gigs in Escrow (to be paid out to clubs)
export const getEscrowGigs = () => {
    return request('/admin/escrow/gigs', {
        method: 'GET',
    });
};

// Admin: Payout Gig Escrow (Upload receipt and mark as completed)
export const payoutGigEscrow = (gigId, file) => {
    const formData = new FormData();
    formData.append('receipt', file);
    return request(`/admin/escrow/gigs/${gigId}/payout`, {
        method: 'PUT',
        body: formData,
    });
};
