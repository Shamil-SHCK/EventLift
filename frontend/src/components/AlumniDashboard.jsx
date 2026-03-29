import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, logoutUser, getEvents, getEventById, getEventsBatch } from '../services/api';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import EventFeed from './EventFeed';
import { Heart, History, Award } from 'lucide-react';

const AlumniDashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalContributed: 0,
        eventsSupported: 0,
        impactBadges: 0
    });
    const [sponsoredEvents, setSponsoredEvents] = useState([]);
    const [viewMode, setViewMode] = useState('feed'); // 'feed' | 'sponsored'
    const navigate = useNavigate();

    const fetchDashboardData = useCallback(async () => {
        try {
            const userData = await getCurrentUser();
            if (userData.role !== 'alumni-individual') {
                navigate('/login');
                return;
            }
            setUser(userData);

            // Fetch Sponsored Events from Profile Data
            const sponsoredData = userData.sponseredEvents || userData.profile?.sponseredEvents || [];
            
            // Extract unique valid event IDs
            const eventIds = [...new Set(sponsoredData.filter(item => item.event).map(item => item.event?._id || item.event))];
            
            let fetchedEvents = [];
            if (eventIds.length > 0) {
                try {
                    fetchedEvents = await getEventsBatch(eventIds);
                    
                    // Map the contribution amount back to the fetched events
                    fetchedEvents = fetchedEvents.map(event => {
                        const sponsorshipRecord = sponsoredData.find(item => 
                            (item.event?._id || item.event) === event._id
                        );
                        return { ...event, myContribution: sponsorshipRecord?.amount || 0 };
                    });
                } catch (err) {
                    console.error("Failed to fetch sponsored events batch:", err);
                }
            }

            let invested = 0;
            let active = fetchedEvents.length;

            fetchedEvents.forEach(event => {
                invested += event.myContribution || 0;
            });

            setStats({
                totalContributed: invested,
                eventsSupported: active,
                impactBadges: Math.floor(invested / 5000)
            });
            setSponsoredEvents(fetchedEvents);

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
                <div className="flex gap-3 items-center">
                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border bg-amber-100 text-amber-700 border-amber-200">
                        Alumni
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4">
                        <Heart className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">₹{stats.totalContributed.toLocaleString()}</h3>
                    <p className="text-slate-500 font-medium text-sm">Total Contributed</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                        <History className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.eventsSupported}</h3>
                    <p className="text-slate-500 font-medium text-sm">Events Supported</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                        <Award className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.impactBadges}</h3>
                    <p className="text-slate-500 font-medium text-sm">Impact Badges</p>
                </div>
            </div>

            {/* View Toggle */}
            <div className="flex mb-8">
                <div className="bg-blue-600 p-1 rounded-xl inline-flex shadow-inner">
                    <button
                        onClick={() => setViewMode('sponsored')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${viewMode === 'sponsored'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-blue-100 hover:bg-white/10'
                            }`}
                    >
                        Sponsored Events
                    </button>
                    <button
                        onClick={() => setViewMode('feed')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${viewMode === 'feed'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-blue-100 hover:bg-white/10'
                            }`}
                    >
                        Event Feed
                    </button>
                </div>
            </div>

            {viewMode === 'feed' && (
                <div className="mb-8 animate-fadeIn">
                    <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6">Support <span className="text-rose-600">Causes</span></h2>
                    <EventFeed userType="alumni" onSponsorshipSuccess={fetchDashboardData} />
                </div>
            )}

            {viewMode === 'sponsored' && (
                <div className="mb-10 animate-fadeIn">
                    <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6 flex items-center gap-2">
                        <Heart className="w-6 h-6 text-rose-600" />
                        Sponsored <span className="text-rose-600">Events</span>
                    </h2>
                    {sponsoredEvents.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl border border-slate-100 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                <History className="w-8 h-8" />
                            </div>
                            <p className="text-slate-500 mb-4">You haven't sponsored any events yet.</p>
                            <button
                                onClick={() => setViewMode('feed')}
                                className="text-indigo-600 font-bold hover:text-indigo-700"
                            >
                                Browse Events &rarr;
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sponsoredEvents.map(event => (
                                <div key={event._id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                                    <div className="h-40 bg-slate-100 relative">
                                        {event.poster ? (
                                            <img src={`${event.poster}`} alt={event.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <Heart className="w-10 h-10" />
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white shadow-sm text-slate-700">
                                            {event.category}
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="font-bold text-slate-900 text-lg mb-1 line-clamp-1">{event.title}</h3>
                                        <p className="text-sm text-slate-500 font-medium mb-4">
                                            by <span className="text-indigo-600">{event.organizer?.clubName || 'Unknown Club'}</span>
                                        </p>

                                        <div className="bg-green-50 p-3 rounded-lg mb-4 border border-green-100">
                                            <p className="text-xs text-green-700 uppercase font-bold mb-1">Your Contribution</p>
                                            <p className="text-xl font-bold text-green-700">₹{event.myContribution?.toLocaleString()}</p>
                                        </div>

                                        <p className="text-xs text-slate-400 mt-auto mb-4">
                                            Event Date: {new Date(event.date).toLocaleDateString()}
                                        </p>

                                        <div className="pt-4 border-t border-slate-50">
                                            <button
                                                onClick={() => navigate(`/events/${event._id}/impact`)}
                                                className="w-full py-2 bg-teal-50 text-teal-700 font-semibold rounded-lg hover:bg-teal-100 transition-colors text-sm"
                                            >
                                                View Impact Report
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </DashboardLayout>
    );
};

export default AlumniDashboard;
