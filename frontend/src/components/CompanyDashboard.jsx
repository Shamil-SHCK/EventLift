import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, logoutUser, getEventById, getEventsBatch, createGigCheckoutSession } from '../services/api';
import { getMyGigs, assignGig, reviewWork } from '../services/api/gigService';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import ClubDirectory from './ClubDirectory';
import { Briefcase, CheckCircle, Search, TrendingUp, Users, ExternalLink, X, Eye } from 'lucide-react';

const CompanyDashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        sponsoredEventsCount: 0,
        totalFundSponsored: 0,
        totalGigsCreated: 0,
        pendingAssignment: 0
    });
    const [myGigs, setMyGigs] = useState([]);
    const [sponsoredEvents, setSponsoredEvents] = useState([]);
    const [viewMode, setViewMode] = useState('gigs'); // 'clubs' | 'gigs' | 'sponsored'
    const [showApplicantsModal, setShowApplicantsModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewForm, setReviewForm] = useState({ decision: 'approve', comment: '' });
    const [selectedGig, setSelectedGig] = useState(null);
    const [assigning, setAssigning] = useState(null);
    const [paying, setPaying] = useState(null);
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            await reviewWork(selectedGig._id, reviewForm.decision, reviewForm.comment);
            const updatedGigs = myGigs.map(g =>
                g._id === selectedGig._id ? { ...g, status: reviewForm.decision === 'approve' ? 'approved' : 'revision_requested' } : g
            );
            setMyGigs(updatedGigs);
            setShowReviewModal(false);
            setReviewForm({ decision: 'approve', comment: '' });
            showToast('success', 'Review submitted successfully');
        } catch (err) {
            showToast('error', err.message || 'Failed to submit review');
        }
    };

    const handlePayGig = async (gig) => {
        setPaying(gig._id);
        try {
            const res = await createGigCheckoutSession(gig._id);
            if (res && res.url) {
                window.location.href = res.url;
            } else {
                showToast('error', 'Failed to initialize payment');
            }
        } catch (err) {
            showToast('error', err.message || 'Error processing payment');
        } finally {
            setPaying(null);
        }
    };

    const fetchDashboardData = useCallback(async () => {
        try {
            const userData = await getCurrentUser();
            console.log(userData);
            if (userData.role !== 'company') {
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
                } catch (err) {
                    console.error("Failed to fetch sponsored events batch:", err);
                }
            }

            let invested = 0;
            let active = 0;
            const mySponsored = [];

            fetchedEvents.forEach(event => {
                const mySponsorships = event.sponsors?.filter(s => {
                    const sId = s.sponsor?._id || s.sponsor;
                    return sId === userData._id || sId === userData.profile?._id || sId === userData.profile;
                }) || [];

                if (mySponsorships.length > 0) {
                    active++;
                    mySponsorships.forEach(s => invested += s.amount);

                    const totalContribution = mySponsorships.reduce((sum, s) => sum + s.amount, 0);
                    mySponsored.push({ ...event, myContribution: totalContribution });
                }
            });

            setSponsoredEvents(mySponsored);

            // Fetch My Gigs & Calculate Stats
            let totalGigs = 0;
            let pendingGigs = 0;
            try {
                const gigsData = await getMyGigs();
                console.log(gigsData);
                setMyGigs(gigsData);
                totalGigs = gigsData.length;
                pendingGigs = gigsData.filter(g => g.status === 'open').length;
            } catch (err) {
                console.error("Failed to fetch my gigs", err);
            }

            setStats({
                sponsoredEventsCount: active,
                totalFundSponsored: invested,
                totalGigsCreated: totalGigs,
                pendingAssignment: pendingGigs
            });

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
            {/* Inline toast */}
            {toast && (
                <div className={`mb-6 p-4 rounded-xl font-medium flex items-center gap-2 text-sm animate-fadeIn
                    ${toast.type === 'success'
                        ? 'bg-green-50 border border-green-100 text-green-700'
                        : 'bg-red-50 border border-red-100 text-red-600'
                    }`}>
                    {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
                </div>
            )}
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
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
                    >
                        <Briefcase className="w-4 h-4" />
                        Post a Gig
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {/* Events Sponsored */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.sponsoredEventsCount}</h3>
                    <p className="text-slate-500 font-medium text-sm">Events Sponsored</p>
                </div>

                {/* Total Funds Sponsored */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">₹{stats.totalFundSponsored.toLocaleString()}</h3>
                    <p className="text-slate-500 font-medium text-sm">Total Funds Sponsored</p>
                </div>

                {/* Total Gigs Created */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.totalGigsCreated}</h3>
                    <p className="text-slate-500 font-medium text-sm">Total Gigs Created</p>
                </div>

                {/* Pending for Assignment */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                        <Users className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.pendingAssignment}</h3>
                    <p className="text-slate-500 font-medium text-sm">Pending Assignment</p>
                </div>
            </div>

            {/* View Toggle */}
            <div className="flex mb-8">
                <div className="bg-blue-600 p-1 rounded-xl inline-flex shadow-inner max-w-full overflow-x-auto">
                    <button
                        onClick={() => setViewMode('gigs')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${viewMode === 'gigs'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-blue-100 hover:bg-white/10'
                            }`}
                    >
                        Posted Gig Works
                    </button>
                    <button
                        onClick={() => setViewMode('sponsored')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${viewMode === 'sponsored'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-blue-100 hover:bg-white/10'
                            }`}
                    >
                        Sponsored Events
                    </button>
                </div>
            </div>

            {/* Clubs Directory Section */}
            {viewMode === 'clubs' && (
                <div className="animate-fadeIn w-full">
                    <ClubDirectory hideLayout={true} />
                </div>
            )}

            {/* My Posted Gigs Section */}
            {viewMode === 'gigs' && (
                <div className="mb-10 animate-fadeIn">
                    <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6 flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-indigo-600" />
                        Posted <span className="text-indigo-600">Gig Works</span>
                    </h2>
                    {myGigs.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl border border-slate-100 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                <Briefcase className="w-8 h-8" />
                            </div>
                            <p className="text-slate-500 mb-4">You haven't posted any gigs yet.</p>
                            <button
                                onClick={() => navigate('/company/create-gig')}
                                className="text-indigo-600 font-bold hover:text-indigo-700"
                            >
                                Post your first Gig &rarr;
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myGigs.map(gig => (
                                <div key={gig._id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                                    <div className="h-40 bg-slate-100 relative">
                                        {gig.poster ? (
                                            <img src={gig.poster.startsWith('http') ? gig.poster : (gig.poster.startsWith('res.cloudinary') ? `https://${gig.poster}` : gig.poster)} alt={gig.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <Briefcase className="w-10 h-10" />
                                            </div>
                                        )}
                                        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white shadow-sm ${gig.status === 'open' ? 'text-green-600' :
                                            gig.status === 'assigned' ? 'text-purple-600' : 'text-slate-600'
                                            }`}>
                                            {gig.status}
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{gig.category}</span>
                                            <span className="font-bold text-slate-900">₹{gig.budget.toLocaleString()}</span>
                                        </div>
                                        <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-1">{gig.title}</h3>
                                        <p className="text-slate-500 text-sm mb-4 line-clamp-2">{gig.description}</p>

                                        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                                            <div className="flex items-center text-slate-500 text-sm">
                                                <Users className="w-4 h-4 mr-1" />
                                                {gig.applicants?.length || 0} applicants
                                            </div>
                                            {gig.status === 'open' && (
                                                <button
                                                    onClick={() => { setSelectedGig(gig); setShowApplicantsModal(true); }}
                                                    className="px-3 py-1.5 bg-blue-50 text-blue-600 text-sm font-bold rounded-lg hover:bg-blue-100 transition-colors"
                                                >
                                                    View Applicants
                                                </button>
                                            )}
                                            {(gig.status === 'assigned' || gig.status === 'revision_requested') && gig.assignedClub && (
                                                <div className="flex flex-col items-end gap-2 text-right">
                                                    {(gig.status === 'revision_requested' || (gig.feedbackHistory && gig.feedbackHistory.length > 0)) && (
                                                        <button
                                                            onClick={() => { setSelectedGig(gig); setShowReviewModal(true); }}
                                                            className="px-3 py-1.5 bg-amber-50 text-amber-600 text-sm font-bold rounded-lg hover:bg-amber-100 transition-colors flex items-center justify-center gap-1"
                                                        >
                                                            <Eye className="w-3 h-3" /> View Remarks
                                                        </button>
                                                    )}
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Assigned to</p>
                                                        <p className="text-sm font-bold text-indigo-600 truncate max-w-[120px]" title={gig.assignedClub.clubName || gig.assignedClub.name}>
                                                            {gig.assignedClub.clubName || gig.assignedClub.name}
                                                        </p>
                                                        {gig.assignedClub.phone && (
                                                            <a href={`tel:${gig.assignedClub.phone}`} className="text-[11px] text-slate-500 mt-0.5 hover:text-indigo-600 flex items-center justify-end gap-1">
                                                                📞 {gig.assignedClub.phone}
                                                            </a>
                                                        )}
                                                        <p className="text-[11px] font-bold text-amber-600 mt-0.5">Awaiting Work</p>
                                                    </div>
                                                </div>
                                            )}
                                            {gig.status === 'submitted' && (
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Work by</p>
                                                        <p className="text-xs font-bold text-indigo-600 truncate max-w-[120px]" title={gig.assignedClub?.clubName || gig.assignedClub?.name}>
                                                            {gig.assignedClub?.clubName || gig.assignedClub?.name}
                                                        </p>
                                                        {gig.assignedClub?.phone && (
                                                            <a href={`tel:${gig.assignedClub?.phone}`} className="text-[11px] text-slate-500 hover:text-indigo-600 flex items-center justify-end gap-1 mt-0.5">
                                                                📞 {gig.assignedClub?.phone}
                                                            </a>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => { setSelectedGig(gig); setShowReviewModal(true); }}
                                                        className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-sm font-bold rounded-lg hover:bg-indigo-100 transition-colors"
                                                    >
                                                        Review Work
                                                    </button>
                                                </div>
                                            )}
                                            {gig.status === 'approved' && (
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Approved for</p>
                                                        <p className="text-xs font-bold text-indigo-600 truncate max-w-[120px]" title={gig.assignedClub?.clubName || gig.assignedClub?.name}>
                                                            {gig.assignedClub?.clubName || gig.assignedClub?.name}
                                                        </p>
                                                        {gig.assignedClub?.phone && (
                                                            <a href={`tel:${gig.assignedClub?.phone}`} className="text-[11px] text-slate-500 hover:text-indigo-600 flex items-center justify-end gap-1 mt-0.5">
                                                                📞 {gig.assignedClub?.phone}
                                                            </a>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <button
                                                            onClick={() => { setSelectedGig(gig); setShowReviewModal(true); }}
                                                            className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-sm font-bold rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1"
                                                        >
                                                            <Eye className="w-3 h-3" /> View Review
                                                        </button>
                                                        <button
                                                            onClick={() => handlePayGig(gig)}
                                                            disabled={paying === gig._id}
                                                            className="px-4 py-1.5 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors shadow-md shadow-green-500/20"
                                                        >
                                                            {paying === gig._id ? 'Processing...' : 'Pay Escrow'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {(gig.status === 'paid_to_platform' || gig.status === 'completed') && (
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Completed by</p>
                                                        <p className="text-xs font-bold text-indigo-600 truncate max-w-[120px]" title={gig.assignedClub?.clubName || gig.assignedClub?.name}>
                                                            {gig.assignedClub?.clubName || gig.assignedClub?.name}
                                                        </p>
                                                        {gig.assignedClub?.phone && (
                                                            <a href={`tel:${gig.assignedClub?.phone}`} className="text-[11px] text-slate-500 hover:text-indigo-600 flex items-center justify-end gap-1 mt-0.5">
                                                                📞 {gig.assignedClub?.phone}
                                                            </a>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <button
                                                            onClick={() => { setSelectedGig(gig); setShowReviewModal(true); }}
                                                            className="px-3 py-1.5 bg-slate-50 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-1"
                                                        >
                                                            <Eye className="w-3 h-3" /> View Review
                                                        </button>
                                                        <p className="text-[11px] font-bold text-green-600 uppercase tracking-wider">Paid 💸</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Sponsored Events Section */}
            {viewMode === 'sponsored' && (
                <div className="mb-10 animate-fadeIn">
                    <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6 flex items-center gap-2">
                        <CheckCircle className="w-6 h-6 text-indigo-600" />
                        Sponsored <span className="text-indigo-600">Events</span>
                    </h2>
                    {sponsoredEvents.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl border border-slate-100 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                <TrendingUp className="w-8 h-8" />
                            </div>
                            <p className="text-slate-500 mb-4">You haven't sponsored any events yet.</p>
                            <button
                                onClick={() => navigate('/company/events')}
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
                                                <Briefcase className="w-10 h-10" />
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

                                        <div className="mt-auto pt-4 border-t border-slate-50">
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

            {/* Applicants Modal */}
            {showApplicantsModal && selectedGig && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-fadeIn overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Applicants</h2>
                                <p className="text-slate-500 text-sm">{selectedGig.title}</p>
                            </div>
                            <button onClick={() => setShowApplicantsModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {selectedGig.applicants && selectedGig.applicants.length > 0 ? (
                                <div className="space-y-4">
                                    {selectedGig.applicants.map((app) => (
                                        <div key={app._id} className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                                                    {app.club?.clubName ? app.club.clubName[0] : 'C'}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-slate-900">{app.club?.clubName || app.club?.name}</h4>
                                                        {app.score !== undefined && (
                                                            <span className="text-[10px] px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full font-bold shadow-sm border border-yellow-200" title="System Match Score">
                                                                Score: {app.score}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm font-semibold text-slate-700 mt-1">
                                                        Bid Amount: <span className="text-green-600">₹{app.bidAmount ? app.bidAmount.toLocaleString() : 'N/A'}</span>
                                                    </div>
                                                    <a
                                                        href={app.linkedInProfile}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                                                    >
                                                        LinkedIn Profile <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                </div>
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm(`Assign gig to ${app.club?.clubName || 'this club'}?`)) {
                                                        setAssigning(app.club._id);
                                                        try {
                                                            await assignGig(selectedGig._id, app.club._id);
                                                            const updatedGigs = myGigs.map(g =>
                                                                g._id === selectedGig._id ? { ...g, status: 'assigned', assignedClub: app.club } : g
                                                            );
                                                            setMyGigs(updatedGigs);
                                                            setShowApplicantsModal(false);
                                                            alert('Gig assigned successfully');
                                                        } catch (err) {
                                                            alert(err.message || 'Failed to assign gig');
                                                        } finally {
                                                            setAssigning(null);
                                                        }
                                                    }
                                                }}
                                                disabled={assigning === (app.club && app.club._id)}
                                                className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                            >
                                                {assigning === (app.club && app.club._id) ? 'Assigning...' : 'Assign Gig'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-500">
                                    <Users className="w-12 h-12 mx-auto text-slate-200 mb-2" />
                                    <p>No applicants yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Review Work Modal */}
            {showReviewModal && selectedGig && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-fadeIn overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    {selectedGig.status === 'submitted' ? 'Review Submitted Work' : 'Work History & Remarks'}
                                </h2>
                            </div>
                            <button onClick={() => setShowReviewModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <h4 className="font-bold text-slate-700 text-sm mb-1">Club Notes:</h4>
                                <p className="text-slate-600 bg-slate-50 p-3 rounded-lg text-sm">{selectedGig.submissionNote || 'No notes provided.'}</p>
                            </div>
                            {selectedGig.submissionUrl && (
                                <div className="mb-6">
                                    <h4 className="font-bold text-slate-700 text-sm mb-2">Attached Proof:</h4>
                                    
                                    {/* Image Preview if it looks like an image */}
                                    {(selectedGig.submissionUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) || !selectedGig.submissionUrl.toLowerCase().endsWith('.pdf')) ? (
                                        <div className="mb-3 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 max-h-60 flex justify-center">
                                            <img 
                                                src={selectedGig.submissionUrl.startsWith('http') ? selectedGig.submissionUrl : `https://${selectedGig.submissionUrl}`} 
                                                alt="Submission Proof" 
                                                className="max-w-full h-auto object-contain cursor-pointer"
                                                onClick={() => window.open(selectedGig.submissionUrl.startsWith('http') ? selectedGig.submissionUrl : `https://${selectedGig.submissionUrl}`, '_blank')}
                                            />
                                        </div>
                                    ) : null}

                                    <a href={selectedGig.submissionUrl.startsWith('http') ? selectedGig.submissionUrl : `https://${selectedGig.submissionUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100 transition-colors text-sm w-full justify-center">
                                        <ExternalLink className="w-4 h-4" /> 
                                        {selectedGig.submissionUrl.toLowerCase().endsWith('.pdf') ? 'View Submission PDF' : 'View Full Submission Work'}
                                    </a>
                                </div>
                            )}

                            <form onSubmit={handleReviewSubmit} className="space-y-4">
                                {selectedGig.status === 'submitted' ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Decision</label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" name="decision" value="approve" checked={reviewForm.decision === 'approve'} onChange={(e) => setReviewForm({ ...reviewForm, decision: e.target.value })} className="text-indigo-600 focus:ring-indigo-500" />
                                                    <span className="text-slate-700 font-medium">Approve & Pay</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" name="decision" value="request_changes" checked={reviewForm.decision === 'request_changes'} onChange={(e) => setReviewForm({ ...reviewForm, decision: e.target.value })} className="text-indigo-600 focus:ring-indigo-500" />
                                                    <span className="text-slate-700 font-medium">Request Improvements</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">
                                                {reviewForm.decision === 'approve' ? 'Remarks / Review' : 'Improvements Needed / Revision Note'}
                                            </label>
                                            <textarea
                                                required={reviewForm.decision === 'request_changes'}
                                                rows="3"
                                                value={reviewForm.comment}
                                                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                                placeholder={reviewForm.decision === 'approve' ? "Add a review of their work..." : "What needs to be fixed?"}
                                            ></textarea>
                                        </div>
                                        <div className="pt-2 flex justify-end gap-3">
                                            <button type="button" onClick={() => setShowReviewModal(false)} className="px-5 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">
                                                Cancel
                                            </button>
                                            <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">
                                                Submit Review
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="text-sm font-bold text-slate-700">Past Remarks:</h4>
                                                {selectedGig.status === 'revision_requested' && (
                                                    <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold animate-pulse">
                                                        Waiting for Club to resubmit
                                                    </span>
                                                )}
                                            </div>
                                            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                                {selectedGig.feedbackHistory && selectedGig.feedbackHistory.length > 0 ? (
                                                    [...selectedGig.feedbackHistory].reverse().map((item, idx) => (
                                                        <div key={idx} className="p-3 bg-white rounded-lg border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className={`text-[10px] font-bold uppercase ${item.decision === 'approve' ? 'text-green-600' : 'text-amber-600'}`}>
                                                                    {item.decision === 'approve' ? 'Approved' : 'Revision Requested'}
                                                                </span>
                                                                <span className="text-[10px] text-slate-400">
                                                                    {new Date(item.timestamp).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-600 whitespace-pre-wrap">{item.comment}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-slate-500 italic">No remarks found.</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="pt-2 flex justify-end">
                                            <button type="button" onClick={() => setShowReviewModal(false)} className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Event Feed removed, moved to dedicated page */}
        </DashboardLayout>
    );
};

export default CompanyDashboard;
