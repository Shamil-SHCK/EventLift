import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, logoutUser, getEvents, getDashboardStats } from '../services/api';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import EventFeed from './EventFeed';
import { Heart, History, Award } from 'lucide-react';

const AlumniDashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const navigate = useNavigate();

    const fetchDashboardData = useCallback(async () => {
        try {
            const userData = await getCurrentUser();
            if (userData.role !== 'alumni-individual') {
                navigate('/login');
                return;
            }
            setUser(userData);

            // Fetch Stats
            const statsData = await getDashboardStats();
            setStats(statsData);

        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
            logoutUser();
            navigate('/login');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <DashboardLayout user={user}>
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold font-heading text-slate-900 mb-2">
                        Alumni <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Space</span>
                    </h1>
                    <p className="text-slate-500 text-lg">Support your alma mater and students.</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border bg-amber-100 text-amber-700 border-amber-200">
                    Alumni / Individual
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                {stats && stats.cards && stats.cards.map((card, index) => {
                    const iconMap = {
                        'Heart': Heart,
                        'DollarSign': Award, // Using Award for Money/Contributed for variety or DollarSign
                        'Award': Award
                    };
                    const IconComponent = iconMap[card.icon] || Heart;

                    return (
                        <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4">
                                <IconComponent className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-1">{card.value}</h3>
                            <p className="text-slate-500 font-medium text-sm">{card.label}</p>
                        </div>
                    );
                })}
            </div>

            <div className="mb-8">
                <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6">Support <span className="text-rose-600">Causes</span></h2>
                <EventFeed userType="alumni" onSponsorshipSuccess={fetchDashboardData} />
            </div>
        </DashboardLayout>
    );
};

export default AlumniDashboard;
