import { request } from './core';

export const getDashboardStats = () => {
    return request('/dashboard/stats', {
        method: 'GET',
    });
};
