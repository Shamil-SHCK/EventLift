import { useState, useEffect } from 'react';
import { getCurrentUser, logoutUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { Rocket, Target, DollarSign, Calendar } from 'lucide-react';

const ClubDashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getCurrentUser();
                if (data.role !== 'club-admin') {
                    navigate('/login');
                    return;
                }
                setUser(data);
            } catch (error) {
                console.error('Failed to fetch user', error);
                logoutUser();
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
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold font-heading text-slate-900 mb-2">
                        Club <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Overview</span>
                    </h1>
                    <p className="text-slate-500 text-lg">Manage your events and sponsorships.</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border bg-green-100 text-green-700 border-green-200">
                    Club Admin
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4">
                        <Rocket className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">0</h3>
                    <p className="text-slate-500 font-medium text-sm">Active Events</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">₹0</h3>
                    <p className="text-slate-500 font-medium text-sm">Funds Raised</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                        <Target className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">0</h3>
                    <p className="text-slate-500 font-medium text-sm">Proposals Sent</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">0</h3>
                    <p className="text-slate-500 font-medium text-sm">Upcoming</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-12 text-center border dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Rocket className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Create Your First Event</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">Start by creating an event to attract sponsors and manage your fundraising campaigns effectively.</p>
                <button className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                    Create Event
                </button>
            </div>
        </DashboardLayout>
    );
};

export default ClubDashboard;
