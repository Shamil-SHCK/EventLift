import React, { useState, useEffect } from 'react';
import { getOpenGigs, applyForGig } from '../services/api/gigService';
import { getCurrentUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Briefcase, CheckCircle, AlertCircle, Users, DollarSign } from 'lucide-react';
import DashboardLayout from './DashboardLayout';

const GigOpportunities = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [gigs, setGigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ category: '', minBudget: '' });
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState('');
    
    // Bidding Modal State
    const [selectedGig, setSelectedGig] = useState(null);
    const [applyForm, setApplyForm] = useState({ linkedInProfile: '', bidAmount: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [userData, gigsData] = await Promise.all([
                    getCurrentUser(),
                    getOpenGigs(filters)
                ]);

                setUser(userData);
                setGigs(gigsData);
                setError('');
            } catch (err) {
                console.error(err);
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleApplyClick = (gig) => {
        setSelectedGig(gig);
        setApplyForm({ linkedInProfile: '', bidAmount: '' });
    };

    const handleFormChange = (e) => {
        setApplyForm({ ...applyForm, [e.target.name]: e.target.value });
    };

    const submitApplication = async (e) => {
        e.preventDefault();
        if (!selectedGig || !applyForm.linkedInProfile || !applyForm.bidAmount) return;

        if (Number(applyForm.bidAmount) > selectedGig.maxBudget) {
            setError(`Your bid cannot exceed the maximum budget limit of ₹${selectedGig.maxBudget}`);
            return;
        }

        setActionLoading(selectedGig._id);
        try {
            await applyForGig(selectedGig._id, applyForm.linkedInProfile, applyForm.bidAmount);
            setError(''); // Clear any previous error
            // Using alert here is okay for success or I can add a success state, 
            // but the user specifically asked for error messages in red.
            alert('Application submitted successfully!');
            setSelectedGig(null);
            
            // Re-fetch gigs
            const gigsData = await getOpenGigs(filters);
            setGigs(gigsData);
        } catch (err) {
            setError(err.msg || 'Failed to submit application');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <DashboardLayout user={user} title="Gig Opportunities">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold font-heading text-slate-900 mb-2">
                        Gig <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Opportunities</span>
                    </h1>
                    <p className="text-slate-500 text-lg">Find work and earn funding for your club.</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                    <div className="relative">
                        <Filter className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                        <select
                            name="category"
                            onChange={handleFilterChange}
                            className="pl-10 pr-8 py-2 border-none bg-transparent text-sm font-semibold text-slate-600 focus:ring-0 cursor-pointer outline-none"
                        >
                            <option value="">All Categories</option>
                            <option value="Tech">Tech</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Design">Design</option>
                            <option value="Event Ops">Event Ops</option>
                        </select>
                    </div>

                    <div className="w-px bg-slate-200 my-1 hidden sm:block"></div>

                    <div className="relative flex items-center px-3">
                        <span className="text-slate-400 text-sm font-bold mr-2">Min Budget:</span>
                        <div className="relative">
                            <span className="absolute left-2 top-1.5 text-slate-400 text-xs">₹</span>
                            <input
                                type="number"
                                name="minBudget"
                                placeholder="0"
                                onChange={handleFilterChange}
                                className="pl-5 w-24 py-1 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none"
                            />
                        </div>
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
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <Briefcase className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No gigs available</h3>
                    <p className="text-slate-500 mt-1">Check back later for new opportunities.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gigs.map(gig => (
                        <div key={gig._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all group flex flex-col h-full">
                            <div className="h-48 bg-slate-100 relative overflow-hidden">
                                {gig.poster ? (
                                    <img
                                        src={gig.poster.startsWith('http') ? gig.poster : (gig.poster.startsWith('res.cloudinary') ? `https://${gig.poster}` : gig.poster)}
                                        alt={gig.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                                        <Briefcase className="w-12 h-12" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider text-indigo-600 shadow-sm">
                                    {gig.category}
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        {gig.company?.organizationName || gig.company?.name || 'Unknown Company'}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold font-heading text-slate-900 mb-2 line-clamp-1">{gig.title}</h3>
                                <p className="text-slate-500 text-sm mb-6 line-clamp-2">{gig.description}</p>

                                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div className="flex flex-col text-slate-900 font-bold text-md">
                                        <div className="text-slate-400 text-xs font-normal">Est. Budget:</div>
                                        ₹{gig.budget.toLocaleString()}
                                        {gig.maxBudget && <div className="text-xs text-indigo-600 font-normal">Max: ₹{gig.maxBudget.toLocaleString()}</div>}
                                    </div>
                                    <button
                                        onClick={() => handleApplyClick(gig)}
                                        disabled={actionLoading === gig._id}
                                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:shadow-none transition-all"
                                    >
                                        {actionLoading === gig._id ? 'Applying...' : 'Apply Now'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Bidding Modal */}
            {selectedGig && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold font-heading text-slate-900">Submit Gig Application</h3>
                            <button onClick={() => setSelectedGig(null)} className="text-slate-400 hover:text-slate-600">
                                &times;
                            </button>
                        </div>
                        {error && (
                            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                        <form onSubmit={submitApplication} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">LinkedIn / Club Profile URL</label>
                                <input
                                    type="url"
                                    name="linkedInProfile"
                                    required
                                    value={applyForm.linkedInProfile}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                    placeholder="https://linkedin.com/in/..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Your Bid Amount (₹)</label>
                                <div className="flex justify-between text-xs text-slate-500 mb-2">
                                    <span>Est. Budget: ₹{selectedGig.budget}</span>
                                    {selectedGig.maxBudget && <span className="text-indigo-600 font-medium">Max Limit: ₹{selectedGig.maxBudget}</span>}
                                </div>
                                <input
                                    type="number"
                                    name="bidAmount"
                                    required
                                    min="1"
                                    max={selectedGig.maxBudget || 10000000}
                                    value={applyForm.bidAmount}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                                    placeholder="Enter proposed fee"
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedGig(null)}
                                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading === selectedGig._id}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default GigOpportunities;
