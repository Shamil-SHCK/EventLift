import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../services/api';
import {
    LayoutDashboard,
    LogOut,
    User,
    Bell,
    Settings,
    Menu,
    Briefcase,
    Calendar,
    IndianRupee,
    Search,
    Users,
    Building2
} from 'lucide-react';

const DashboardLayout = ({ children, user: userProp, title = "Dashboard" }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    // Fallback if user prop is not provided
    const user = userProp || (() => {
        try {
            return JSON.parse(localStorage.getItem('user') || 'null');
        } catch {
            return null;
        }
    })();

    const handleLogout = () => {
        logoutUser();
        navigate('/');
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
                        <span
                            className="text-xl font-bold font-heading tracking-tight cursor-pointer"
                            onClick={() => navigate('/')}
                        >
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Event</span>
                            <span className="text-white">Lift</span>
                        </span>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 py-6 px-4 space-y-2">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Menu</div>

                        <button onClick={() => navigate(`/${user?.role === 'administrator' ? 'admin' : user?.role === 'club-admin' ? 'club' : user?.role === 'alumni-individual' ? 'alumni' : 'company'}/dashboard`)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${title === 'Dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                            <LayoutDashboard className="w-5 h-5" /> Dashboard
                        </button>

                        {user?.role === 'administrator' && (
                            <button onClick={() => navigate('/admin/transactions')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${title === 'Transactions' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                                <IndianRupee className="w-5 h-5" /> Platform Transfers
                            </button>
                        )}

                        {user?.role === 'company' && (
                            <button onClick={() => navigate('/company/events')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${title === 'Events' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                                <Calendar className="w-5 h-5" /> Events
                            </button>
                        )}

                        {user?.role === 'club-admin' && (
                            <button onClick={() => navigate('/club/gig-opportunities')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${title === 'Gig Opportunities' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                                <Briefcase className="w-5 h-5" /> Gig Works
                            </button>
                        )}

                        {(user?.role === 'company' || user?.role === 'alumni-individual') && (
                            <button onClick={() => navigate('/transactions')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${title === 'Transaction History' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                                <IndianRupee className="w-5 h-5" /> Transactions
                            </button>
                        )}

                        <button onClick={() => navigate('/search')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${title === 'Search Users' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                            <Search className="w-5 h-5" /> Search Users
                        </button>

                        <button onClick={() => navigate('/profile')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${title === 'Profile' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                            <User className="w-5 h-5" /> Profile
                        </button>

                        {user?.role === 'club-admin' ? (
                            <button onClick={() => navigate('/club/team')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${title === 'Our Team' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                                <Users className="w-5 h-5" /> Our Team
                            </button>
                        ) : (user?.role === 'alumni-individual' || user?.role === 'company') ? (
                            <button onClick={() => navigate('/clubs')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${title === 'Club Directory' || title === 'Club Profile' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                                <Building2 className="w-5 h-5" /> Browse Clubs
                            </button>
                        ) : (
                            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                                <Bell className="w-5 h-5" /> Notifications
                            </button>
                        )}

                        <button onClick={() => navigate('/settings')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${title === 'Settings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                            <Settings className="w-5 h-5" /> Settings
                        </button>
                    </div>

                    {/* User Profile Snippet Bottom */}
                    <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                        {user && (
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                </div>
                            </div>
                        )}
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
                    {/* Verification Status Check */}
                    {user && user.role !== 'administrator' && user.verificationStatus !== 'verified' ? (
                        <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto">
                            {user.verificationStatus === 'pending' ? (
                                <>
                                    <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                        <Bell className="w-10 h-10" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-3">Application Under Review</h2>
                                    <p className="text-slate-500 text-lg mb-8">
                                        Thanks for verifying your email! Your account is currently pending administrative approval.
                                        We review all registrations to ensure the safety of our community.
                                        Please check back later.
                                    </p>
                                    <button onClick={handleLogout} className="px-6 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium rounded-lg transition-colors">
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                                        <LogOut className="w-10 h-10" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-3">Application Declined</h2>
                                    <p className="text-slate-500 text-lg mb-8">
                                        Unfortunately, your registration request has been declined by our administrators.
                                        If you believe this is a mistake, please contact support.
                                    </p>
                                    <button onClick={handleLogout} className="px-6 py-2.5 bg-red-600 text-white hover:bg-red-700 font-medium rounded-lg transition-colors">
                                        Logout
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        children
                    )}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
