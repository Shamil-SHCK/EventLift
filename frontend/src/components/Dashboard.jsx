import { useState, useEffect } from 'react';
import { getCurrentUser, logoutUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import AdminPanel from './AdminPanel';
import {
    LayoutDashboard,
    LogOut,
    User,
    Bell,
    Settings,
    ChevronDown,
    Menu,
    X,
    Building2,
    GraduationCap,
    Users
} from 'lucide-react';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getCurrentUser();
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

    const handleLogout = () => {
        logoutUser();
        setUser(null);
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const RoleBadge = ({ role }) => {
        const styles = {
            'administrator': 'bg-purple-100 text-purple-700 border-purple-200',
            'company': 'bg-blue-100 text-blue-700 border-blue-200',
            'club-admin': 'bg-green-100 text-green-700 border-green-200',
            'alumni-individual': 'bg-amber-100 text-amber-700 border-amber-200'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${styles[role] || 'bg-gray-100 text-gray-700'}`}>
                {role?.replace('-', ' ')}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex">
            {/* Sidebar - Mobile: Overlay, Desktop: Static */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="h-full flex flex-col">
                    {/* Brand */}
                    <div className="h-16 flex items-center px-6 border-b border-slate-800">
                        <span className="text-xl font-bold font-heading tracking-tight text-white">EventLift</span>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 py-6 px-4 space-y-2">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Menu</div>

                        <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-blue-600 rounded-lg text-white font-medium transition-all shadow-lg shadow-blue-500/20">
                            <LayoutDashboard className="w-5 h-5" /> Dashboard
                        </button>

                        <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                            <User className="w-5 h-5" /> Profile
                        </button>

                        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                            <Bell className="w-5 h-5" /> Notifications
                            <span className="ml-auto bg-red-500 text-white text-xs py-0.5 px-2 rounded-full">2</span>
                        </button>

                        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                            <Settings className="w-5 h-5" /> Settings
                        </button>
                    </div>

                    {/* User Profile Snippet Bottom */}
                    <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
                                {user?.name.charAt(0)}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all border border-transparent hover:border-red-400/20"
                        >
                            <LogOut className="w-4 h-4" /> Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 min-h-screen flex flex-col">
                {/* Top Header Mobile */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:hidden sticky top-0 z-30">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600">
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="font-bold text-slate-900">EventLift</span>
                    <div className="w-8"></div> {/* Spacer */}
                </header>

                <div className="flex-1 p-6 lg:p-10 overflow-x-hidden">
                    {/* Welcome Header */}
                    <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold font-heading text-slate-900 mb-2">
                                Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{user?.name}</span>
                            </h1>
                            <p className="text-slate-500 text-lg">Here's what's happening today.</p>
                        </div>
                        <RoleBadge role={user?.role} />
                    </div>

                    {/* Stats / Quick Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {/* Dynamic cards based on role could go here. For now, generic placeholders matching style */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                                {user?.role === 'company' ? <Building2 className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-1">
                                {user?.role === 'administrator' ? '12' : '0'}
                            </h3>
                            <p className="text-slate-500 font-medium text-sm">
                                {user?.role === 'administrator' ? 'Pending Verifications' : 'Active Events'}
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-1">
                                {user?.role === 'administrator' ? '45' : '₹0'}
                            </h3>
                            <p className="text-slate-500 font-medium text-sm">
                                {user?.role === 'administrator' ? 'Active Users' : 'Total Raised'}
                            </p>
                        </div>
                    </div>

                    {/* Admin Panel Embedded */}
                    {user?.role === 'administrator' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h3 className="text-lg font-bold font-heading text-slate-900">User Verification Management</h3>
                            </div>
                            <div className="p-0"> {/* AdminPanel has its own padding we should adjust later, but for now passing simple prop */}
                                <AdminPanel isEmbedded={true} />
                            </div>
                        </div>
                    )}

                    {/* Other Role Empty States */}
                    {user?.role !== 'administrator' && (
                        <div className="bg-white rounded-2xl p-12 text-center border dashed border-slate-200">
                            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LayoutDashboard className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Dashboard Coming Soon</h3>
                            <p className="text-slate-500">We are building specific tools for {user?.role?.replace('-', ' ')}s.</p>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

export default Dashboard;
