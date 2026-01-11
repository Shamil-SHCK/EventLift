import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, logoutUser, getEvents } from '../services/api';
import { getMyGigs } from '../services/api/gigService';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import EventFeed from './EventFeed';
import { Briefcase, CheckCircle, Search, TrendingUp } from 'lucide-react';

const CompanyDashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        activeSponsorships: 0,
        clubsSupported: 0,
        totalInvested: 0
    });
    const [myGigs, setMyGigs] = useState([]);
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
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Gig Title</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Budget</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned To</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {myGigs.map(gig => (
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                {gig.assignedClub ? (
                                                    <span className="font-medium text-slate-900">{gig.assignedClub.name}</span>
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
                )}
            </div>

            <div className="mb-8">
                <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6">Explore <span className="text-blue-600">Events</span></h2>
                <EventFeed userType="company" onSponsorshipSuccess={fetchDashboardData} />
            </div>
        </DashboardLayout>
    );
};

export default CompanyDashboard;
