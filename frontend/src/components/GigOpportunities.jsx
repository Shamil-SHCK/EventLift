import React, { useState, useEffect } from 'react';
import { getOpenGigs, applyForGig } from '../services/api/gigService';
import { getCurrentUser } from '../services/api';
import DashboardLayout from './DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Briefcase, CheckCircle, AlertCircle } from 'lucide-react';

const GigOpportunities = () => {
    const [user, setUser] = useState(null);
    const [gigs, setGigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ category: '', minBudget: '' });
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const init = async () => {
            try {
                const userData = await getCurrentUser();
                if (userData.role !== 'club-admin') {
                    navigate('/login');
                    return;
                }
                setUser(userData);

                // Fetch Gigs
                const data = await getOpenGigs(filters);
                setGigs(data);
            } catch (err) {
                console.error("Error loading page data", err);
                setError('Failed to load data');
                if (!user) navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [navigate, filters]);


    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleApply = async (gigId) => {
        setActionLoading(gigId);
        try {
            await applyForGig(gigId);
            // Update local state to show applied
            setGigs(gigs.map(g => {
                if (g._id === gigId) {
                    return { ...g, applicants: [...(g.applicants || []), { club: user._id, status: 'pending' }] };
                }
                return g;
            }));
            alert('Application sent successfully!');
        } catch (err) {
            alert(err.response?.data?.msg || err.message || 'Failed to apply');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading && !user) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <DashboardLayout user={user}>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-slate-900 mb-2 flex items-center gap-3">
                        <Briefcase className="w-8 h-8 text-blue-600" />
                        Gig <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Works</span>
                    </h1>
                    <p className="text-slate-500 text-lg">Find work and earn funding for your club.</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                    <div className="relative">
                        <Filter className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <select
                            name="category"
                            onChange={handleFilterChange}
                            className="pl-9 pr-8 py-2 border-none bg-slate-50 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                        >
                            <option value="">All Categories</option>
                            <option value="Tech">Tech</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Design">Design</option>
                            <option value="Event Ops">Event Ops</option>
                        </select>
                    </div>

                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">$</span>
                        <input
                            type="number"
                            name="minBudget"
                            placeholder="Min Budget"
                            onChange={handleFilterChange}
                            className="pl-7 pr-4 py-2 border-none bg-slate-50 rounded-lg text-sm font-medium text-slate-700 w-32 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center border border-red-100">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {error}
                </div>
            )}

            {gigs.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Briefcase className="w-8 h-8" />
                    </div>
                    <p className="text-slate-500 text-lg font-medium">No gigs available matching your filters.</p>
                    <button onClick={() => setFilters({ category: '', minBudget: '' })} className="mt-4 text-blue-600 font-bold hover:underline">
                        Clear Filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gigs.map(gig => {
                        const hasApplied = gig.applicants && gig.applicants.some(app => app.club === user._id || (typeof app.club === 'object' && app.club._id === user._id));

                        return (
                            <div key={gig._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 uppercase tracking-wider">
                                            {gig.category}
                                        </span>
                                        <span className="text-xl font-bold text-green-600">${gig.budget}</span>
                                    </div>

                                    <h3 className="text-xl font-bold font-heading text-slate-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">{gig.title}</h3>
                                    <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">{gig.description}</p>

                                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                                        <div className="text-xs text-slate-500 font-medium">
                                            by <span className="text-slate-900">{gig.company?.organizationName || gig.company?.name || 'Unknown'}</span>
                                        </div>
                                        <button
                                            onClick={() => handleApply(gig._id)}
                                            disabled={actionLoading === gig._id || hasApplied}
                                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-lg focus:outline-none shadow-lg transition-all 
                                            ${hasApplied
                                                    ? 'bg-green-100 text-green-700 shadow-none cursor-default'
                                                    : 'text-white bg-slate-900 hover:bg-blue-600 shadow-slate-200 disabled:opacity-50 disabled:hover:bg-slate-900'
                                                }`}
                                        >
                                            {actionLoading === gig._id ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                            ) : hasApplied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Briefcase className="w-4 h-4 mr-2" />}

                                            {actionLoading === gig._id ? 'Applying...' : hasApplied ? 'Applied' : 'Apply Now'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </DashboardLayout>
    );
};

export default GigOpportunities;
