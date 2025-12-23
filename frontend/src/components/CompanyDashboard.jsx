import { useState, useEffect } from 'react';
import { getCurrentUser, logoutUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { Briefcase, CheckCircle, Search, TrendingUp } from 'lucide-react';

const CompanyDashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getCurrentUser();
                if (data.role !== 'company') {
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
                        Company <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Portal</span>
                    </h1>
                    <p className="text-slate-500 text-lg">Find events and manage sponsorships.</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border bg-blue-100 text-blue-700 border-blue-200">
                    Company
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">0</h3>
                    <p className="text-slate-500 font-medium text-sm">Active Sponsorships</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">0</h3>
                    <p className="text-slate-500 font-medium text-sm">Approvals Pending</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">₹0</h3>
                    <p className="text-slate-500 font-medium text-sm">Total Invested</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-12 text-center border dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Explore Sponsorship Opportunities</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">Discover events that align with your brand values and reach your target audience.</p>
                <button className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
                    Find Events
                </button>
            </div>
        </DashboardLayout>
    );
};

export default CompanyDashboard;
