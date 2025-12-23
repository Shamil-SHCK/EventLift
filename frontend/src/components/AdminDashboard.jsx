import { useState, useEffect } from 'react';
import { getCurrentUser, logoutUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import AdminPanel from './AdminPanel';
import { Building2, GraduationCap, Users } from 'lucide-react';

const AdminDashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getCurrentUser();
                if (data.role !== 'administrator') {
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
            {/* Welcome Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold font-heading text-slate-900 mb-2">
                        Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Console</span>
                    </h1>
                    <p className="text-slate-500 text-lg">Platform overview and user verification.</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border bg-purple-100 text-purple-700 border-purple-200">
                    Administrator
                </span>
            </div>

            {/* Stats / Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                        <Users className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">12</h3>
                    <p className="text-slate-500 font-medium text-sm">Pending Verifications</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
                        <GraduationCap className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">45</h3>
                    <p className="text-slate-500 font-medium text-sm">Active Users</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">8</h3>
                    <p className="text-slate-500 font-medium text-sm">Organizations</p>
                </div>
            </div>

            {/* Admin Panel Embedded */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold font-heading text-slate-900">User Verification Management</h3>
                </div>
                <div className="p-0">
                    <AdminPanel isEmbedded={true} />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
