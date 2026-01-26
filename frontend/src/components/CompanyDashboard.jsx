import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, logoutUser, getEvents, getDashboardStats, getMySponsoredEvents } from '../services/api';
import { getMyGigs } from '../services/api/gigService';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import EventFeed from './EventFeed';
import PostEventReportView from './PostEventReportView';
import { Briefcase, CheckCircle, Search, TrendingUp, Plus, Heart, FileText } from 'lucide-react';

const CompanyDashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [myGigs, setMyGigs] = useState([]);
    const [sponsoredEvents, setSponsoredEvents] = useState([]);
    const [viewMode, setViewMode] = useState('sponsored'); // 'ongoing', 'completed', 'sponsored'
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportEventId, setReportEventId] = useState(null);
    const navigate = useNavigate();

    const fetchDashboardData = useCallback(async () => {
        try {
            const userData = await getCurrentUser();
            if (userData.role !== 'company') {
                navigate('/login');
                return;
            }
            setUser(userData);

            // Parallel Fetch
            const [statsData, gigsData, sponsoredData] = await Promise.allSettled([
                getDashboardStats(),
                getMyGigs(),
                getMySponsoredEvents()
            ]);

            if (statsData.status === 'fulfilled') setStats(statsData.value);
            if (gigsData.status === 'fulfilled') setMyGigs(gigsData.value);
            if (sponsoredData.status === 'fulfilled') setSponsoredEvents(sponsoredData.value);

            // Log errors if any
            if (gigsData.status === 'rejected') console.error("Failed to fetch my gigs", gigsData.reason);
            if (sponsoredData.status === 'rejected') console.error("Failed to fetch sponsored events", sponsoredData.reason);
            console.log("Dashboard data fetched");

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

    // Filter Gigs
    const displayedGigs = myGigs.filter(gig => {
        if (viewMode === 'ongoing') {
            return gig.status === 'open' || gig.status === 'accepted';
        } else {
            return gig.status === 'completed';
        }
    });

    return (
        <DashboardLayout user={user}>
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold font-heading text-slate-900 mb-2">
                        Company <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Portal</span>
                    </h1>
                    <p className="text-slate-500 text-lg">Find events and manage sponsorships.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/company/create-gig')}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all"
                    >
                        <Plus className="w-5 h-5" /> Post Gig
                    </button>
                    {/* <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border bg-blue-100 text-blue-700 border-blue-200 flex items-center">
                        Company
                    </span> */}{/* Hiding role badge as it might be redundant next to the big header */}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                {stats && stats.cards && stats.cards.map((card, index) => {
                    const iconMap = {
                        'Briefcase': Briefcase,
                        'Activity': CheckCircle, // Fallback
                        'Heart': CheckCircle,
                        'DollarSign': TrendingUp
                    };
                    const IconComponent = iconMap[card.icon] || Briefcase;

                    return (
                        <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                                <IconComponent className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-1">{card.value}</h3>
                            <p className="text-slate-500 font-medium text-sm">{card.label}</p>
                        </div>
                    );
                })}
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
                        onClick={() => setViewMode('ongoing')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${viewMode === 'ongoing'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-blue-100 hover:bg-white/10'
                            }`}
                    >
                        Ongoing Gigs
                    </button>
                    <button
                        onClick={() => setViewMode('completed')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${viewMode === 'completed'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-blue-100 hover:bg-white/10'
                            }`}
                    >
                        Completed
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="mb-10 animate-fadeIn">
                <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6">
                    {viewMode === 'ongoing' ? 'Ongoing Gigs' :
                        viewMode === 'completed' ? 'Completed Gigs' :
                            'Sponsored Events'}
                </h2>
                {viewMode === 'sponsored' ? (
                    sponsoredEvents.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl border border-slate-100 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                <Heart className="w-8 h-8" />
                            </div>
                            <p className="text-slate-500 mb-4">You haven't sponsored any events yet.</p>
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

                                        <div className="bg-blue-50 p-3 rounded-lg mb-4">
                                            <p className="text-xs text-blue-600 font-bold uppercase">Your Contribution</p>
                                            <p className="text-lg font-bold text-blue-700">₹{event.myContribution || event.amount || 0}</p>
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
                    )
                ) : (
                    displayedGigs.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl border border-slate-100 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                <Briefcase className="w-8 h-8" />
                            </div>
                            <p className="text-slate-500 mb-4">No {viewMode} gigs found.</p>
                            {viewMode === 'ongoing' && (
                                <button
                                    onClick={() => navigate('/company/create-gig')}
                                    className="text-indigo-600 font-bold hover:text-indigo-700"
                                >
                                    Post your first Gig &rarr;
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Gig Title</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Budget</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Applicants</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned To</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {displayedGigs.map(gig => (
                                            <tr key={gig._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-bold text-slate-900">{gig.title}</div>
                                                    <div className="text-xs text-slate-400">{new Date(gig.createdAt).toLocaleDateString()}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                        {gig.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-700">
                                                    ${gig.budget}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${gig.status === 'open' ? 'bg-green-100 text-green-800' :
                                                        gig.status === 'accepted' ? 'bg-purple-100 text-purple-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {gig.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {gig.status === 'open' ? (
                                                        <button
                                                            onClick={() => navigate(`/company/gig/${gig._id}/applicants`)}
                                                            className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                                                        >
                                                            {gig.applicants?.length || 0} Applicants
                                                        </button>
                                                    ) : (
                                                        <span className="text-slate-400">{gig.applicants?.length} Applied</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                    {gig.assignedClub ? (
                                                        <span className="font-medium text-slate-900">{gig.assignedClub.clubName || gig.assignedClub.name}</span>
                                                    ) : (
                                                        <span className="text-slate-400 italic">--</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                )}
            </div>
        </DashboardLayout>
    );
};

export default CompanyDashboard;
