import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, logoutUser, getEvents } from '../services/api';
import { getMyGigs, assignGig } from '../services/api/gigService';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { Briefcase, CheckCircle, Search, TrendingUp, Users, ExternalLink, X } from 'lucide-react';

const CompanyDashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        activeSponsorships: 0,
        clubsSupported: 0,
        totalInvested: 0
    });
    const [myGigs, setMyGigs] = useState([]);
    const [showApplicantsModal, setShowApplicantsModal] = useState(false);
    const [selectedGig, setSelectedGig] = useState(null);
    const [assigning, setAssigning] = useState(null);
    const navigate = useNavigate();

    const fetchDashboardData = useCallback(async () => {
        try {
            const userData = await getCurrentUser();
            if (userData.role !== 'company') {
                navigate('/login');
                return;
            }
            setUser(userData);

            // Fetch Stats
            const allEvents = await getEvents();
            let invested = 0;
            let active = 0;
            const clubs = new Set();

            allEvents.forEach(event => {
                const mySponsorships = event.sponsors?.filter(s => {
                    const sId = s.sponsor?._id || s.sponsor;
                    return sId === userData._id;
                }) || [];

                if (mySponsorships.length > 0) {
                    active++;
                    if (event.organizer) {
                        const clubId = event.organizer._id || event.organizer;
                        clubs.add(clubId);
                    }
                    mySponsorships.forEach(s => invested += s.amount);
                }
            });

            setStats({
                activeSponsorships: active,
                clubsSupported: clubs.size,
                totalInvested: invested
            });

            // Fetch My Gigs
            try {
                const gigsData = await getMyGigs();
                setMyGigs(gigsData);
                console.log(gigsData);
            } catch (err) {
                console.error("Failed to fetch my gigs", err);
            }

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
                        Company <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Portal</span>
                    </h1>
                    <p className="text-slate-500 text-lg">Find events and manage sponsorships.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/company/create-gig')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center"
                    >
                        <Briefcase className="w-4 h-4 mr-2" />
                        Post Gig
                    </button>
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border bg-blue-100 text-blue-700 border-blue-200 flex items-center">
                        Company
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.activeSponsorships}</h3>
                    <p className="text-slate-500 font-medium text-sm">Active Sponsorships</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.clubsSupported}</h3>
                    <p className="text-slate-500 font-medium text-sm">Clubs Supported</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">₹{stats.totalInvested.toLocaleString()}</h3>
                    <p className="text-slate-500 font-medium text-sm">Total Invested</p>
                </div>
            </div>

            {/* My Posted Gigs Section */}
            <div className="mb-10">
                <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6">My Posted <span className="text-blue-600">Gigs</span></h2>
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
                                        <img src={`http://localhost:5000/${gig.poster}`} alt={gig.title} className="w-full h-full object-cover" />
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
                                        {gig.status === 'assigned' && gig.assignedClub && (
                                            <div className="text-right">
                                                <p className="text-xs text-slate-400">Assigned to</p>
                                                <p className="text-sm font-bold text-slate-800">{gig.assignedClub.clubName || gig.assignedClub.name || 'Club'}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

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
                                                    {app.club.clubName ? app.club.clubName[0] : 'C'}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900">{app.club.clubName || app.club.name}</h4>
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
                                                    if (window.confirm(`Assign gig to ${app.club.clubName || 'this club'}?`)) {
                                                        setAssigning(app.club._id);
                                                        try {
                                                            await assignGig(selectedGig._id, app.club._id);
                                                            // Update local state
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
                                                disabled={assigning === app.club._id}
                                                className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                            >
                                                {assigning === app.club._id ? 'Assigning...' : 'Assign Gig'}
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

            {/* Event Feed removed, moved to dedicated page */}
        </DashboardLayout>
    );
};

export default CompanyDashboard;
