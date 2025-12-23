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
} from 'lucide-react';

const DashboardLayout = ({ children, user, title = "Dashboard" }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

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
                        <span className="text-xl font-bold font-heading tracking-tight text-white cursor-pointer" onClick={() => navigate('/')}>EventLift</span>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 py-6 px-4 space-y-2">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Menu</div>

                        <button onClick={() => navigate(`/${user?.role === 'administrator' ? 'admin' : user?.role === 'club-admin' ? 'club' : user?.role === 'alumni-individual' ? 'alumni' : 'company'}/dashboard`)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${title === 'Dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
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
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
