import { useState, useCallback } from 'react';
import DashboardLayout from './DashboardLayout';
import EventFeed from './EventFeed';
import { Calendar } from 'lucide-react';

const CompanyEventManagement = () => {
    const user = JSON.parse(localStorage.getItem('user'));

    // Callback to refresh data if needed, passed to EventFeed
    const handleSponsorshipSuccess = useCallback(() => {
        // You might want to refresh stats or show a notification here
        console.log("Sponsorship successful, refreshing data...");
    }, []);

    return (
        <DashboardLayout user={user} title="Events">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-heading text-slate-900">
                    Explore <span className="text-blue-600">Events</span>
                </h1>
                <p className="text-slate-500 text-lg">Browse upcoming events and find sponsorship opportunities.</p>
            </div>

            <EventFeed userType="company" onSponsorshipSuccess={handleSponsorshipSuccess} />
        </DashboardLayout>
    );
};

export default CompanyEventManagement;
