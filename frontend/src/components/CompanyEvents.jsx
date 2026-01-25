import React, { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import { getCurrentUser, getEvents } from '../services/api';
import EventFeed from './EventFeed';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';

const CompanyEvents = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getCurrentUser();
                if (userData.role !== 'company') {
                    navigate('/login');
                    return;
                }
                setUser(userData);
            } catch (error) {
                console.error("Failed to fetch user", error);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [navigate]);

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <DashboardLayout user={user}>
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-heading text-slate-900 mb-2 flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-blue-600" />
                    Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Events</span>
                </h1>
                <p className="text-slate-500 text-lg">Detailed list of all events looking for sponsorship.</p>
            </div>

            <EventFeed userType="company" />
        </DashboardLayout>
    );
};

export default CompanyEvents;
