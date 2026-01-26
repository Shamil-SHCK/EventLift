import { request } from './core';

// Create a new report
export const createReport = (reportData) => {
    return request('/reports', {
        method: 'POST',
        body: reportData, // FormData
    });
};

// Get report by event ID
export const getReportByEvent = (eventId) => {
    return request(`/reports/${eventId}`, {
        method: 'GET',
    });
};
