import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, getDashboardStats, getMySponsoredEvents } from '../services/api';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import EventFeed from './EventFeed';
import { Heart, Award, FileText } from 'lucide-react';
import PostEventReportView from './PostEventReportView';

const AlumniDashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [sponsoredEvents, setSponsoredEvents] = useState([]);
    const [viewMode, setViewMode] = useState('upcoming'); // 'upcoming', 'past', 'sponsored'
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportEventId, setReportEventId] = useState(null);
    const navigate = useNavigate();

    const fetchDashboardData = useCallback(async () => {
        try {
            const userData = await getCurrentUser();
            if (userData.role !== 'alumni-individual') {
                navigate('/login');
                return;
            }
            setUser(userData);

            // Parallel Fetch
            const [statsData, sponsoredData] = await Promise.all([
                getDashboardStats(),
                getMySponsoredEvents()
            ]);

            setStats(statsData);
            setSponsoredEvents(sponsoredData);

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
                {/* View Toggle */}
                <div className="flex mb-8">
                    <div className="bg-amber-500 p-1 rounded-xl inline-flex shadow-inner">
                        <button
                            onClick={() => setViewMode('upcoming')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${viewMode === 'upcoming'
                                ? 'bg-white text-amber-600 shadow-sm'
                                : 'text-amber-100 hover:bg-white/10'
                                }`}
                        >
                            Upcoming Events
                        </button>
                        <button
                            onClick={() => setViewMode('past')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${viewMode === 'past'
                                ? 'bg-white text-amber-600 shadow-sm'
                                : 'text-amber-100 hover:bg-white/10'
                                }`}
                        >
                            Past Events
                        </button>
                        <button
                            onClick={() => setViewMode('sponsored')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${viewMode === 'sponsored'
                                ? 'bg-white text-amber-600 shadow-sm'
                                : 'text-amber-100 hover:bg-white/10'
                                }`}
                        >
                            Sponsored Events
                        </button>
                    </div>
                </div>

                {viewMode === 'sponsored' ? (
                    <div className="animate-fadeIn">
                        <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6">Your <span className="text-amber-600">Contributions</span></h2>
                        {sponsoredEvents.length === 0 ? (
                            <div className="bg-white p-8 rounded-xl border border-slate-100 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                    <Heart className="w-8 h-8" />
                                </div>
                                <p className="text-slate-500 mb-4">You haven't supported any events yet.</p>
                                <button onClick={() => setViewMode('upcoming')} className="text-amber-600 font-bold hover:underline">
                                    Browse Upcoming Events
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sponsoredEvents.map(event => (
                                    <div key={event._id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all flex flex-col h-full">
                                        <div className="h-40 bg-slate-100 relative">
                                            {event.poster ? (
                                                <img src={`http://localhost:5000/${event.poster}`} alt={event.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full text-slate-300">
                                                    <Heart className="w-12 h-12" />
                                                </div>
                                            )}
                                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                                                {event.status}
                                            </div>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <h3 className="font-bold text-lg text-slate-900 mb-1">{event.title}</h3>
                                            <p className="text-sm text-slate-500 mb-4">{new Date(event.date).toLocaleDateString()}</p>

                                            <div className="bg-amber-50 p-3 rounded-lg mb-4">
                                                <p className="text-xs text-amber-600 font-bold uppercase">Your Contribution</p>
                                                <p className="text-lg font-bold text-amber-700">₹{event.myContribution || event.amount || 0}</p>
                                            </div>

                                            <div className="mt-auto">
                                                {event.status === 'completed' ? (
                                                    <button
                                                        onClick={() => { setReportEventId(event._id); setShowReportModal(true); }}
                                                        className="w-full py-2 bg-green-50 text-green-700 font-bold rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2 text-sm"
                                                    >
                                                        <FileText className="w-4 h-4" /> View Report
                                                    </button>
                                                ) : (
                                                    <div className="w-full py-2 bg-slate-100 text-slate-400 font-bold rounded-lg text-center text-sm cursor-not-allowed">
                                                        Report Pending
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {/* Report Modal */}
                        {showReportModal && reportEventId && (
                            <PostEventReportView
                                eventId={reportEventId}
                                onClose={() => setShowReportModal(false)}
                            />
                        )}
                    </div>
                ) : (
                    <div className="animate-fadeIn">
                        <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6">
                            {viewMode === 'upcoming' ? 'Upcoming' : 'Past'} <span className="text-rose-600">Events</span>
                        </h2>
                        <EventFeed
                            userType="alumni"
                            onSponsorshipSuccess={fetchDashboardData}
                            filterMode={viewMode}
                        />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AlumniDashboard;
