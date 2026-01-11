import React, { useState, useEffect } from 'react';
import { getOpenGigs, acceptGig } from '../services/api/gigService';
import { Search, Filter, Briefcase, CheckCircle, AlertCircle } from 'lucide-react';

const GigOpportunities = () => {
    const [gigs, setGigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ category: '', minBudget: '' });
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState('');

    const fetchGigs = async () => {
        try {
            setLoading(true);
            const data = await getOpenGigs(filters);
            setGigs(data);
            setError('');
        } catch (err) {
            setError('Failed to load gigs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGigs();
    }, [filters]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleAccept = async (gigId) => {
        if (!window.confirm('Are you sure you want to accept this gig?')) return;

        setActionLoading(gigId);
        try {
            await acceptGig(gigId);
            // Refresh list or remove item
            setGigs(gigs.filter(g => g._id !== gigId));
            alert('Gig accepted!');
        } catch (err) {
            alert(err.message || 'Failed to accept gig');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gig Opportunities</h1>
                    <p className="text-gray-500">Find work and earn funding for your club</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <div className="relative">
                        <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <select
                            name="category"
                            onChange={handleFilterChange}
                            className="pl-9 pr-8 py-2 border rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">All Categories</option>
                            <option value="Tech">Tech</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Design">Design</option>
                            <option value="Event Ops">Event Ops</option>
                        </select>
                    </div>

                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-400 text-sm">$</span>
                        <input
                            type="number"
                            name="minBudget"
                            placeholder="Min Budget"
                            onChange={handleFilterChange}
                            className="pl-7 pr-3 py-2 border rounded-md text-sm w-32 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Loading opportunities...</p>
                </div>
            ) : gigs.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                    <Briefcase className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-2 text-gray-500">No gigs available at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gigs.map(gig => (
                        <div key={gig._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                        {gig.category}
                                    </span>
                                    <span className="text-lg font-bold text-green-600">${gig.budget}</span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{gig.title}</h3>
                                <p className="text-gray-500 text-sm mb-4 line-clamp-3">{gig.description}</p>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                    <div className="text-xs text-gray-500">
                                        Posted by <span className="font-medium text-gray-900">{gig.company?.name || 'Unknown'}</span>
                                    </div>
                                    <button
                                        onClick={() => handleAccept(gig._id)}
                                        disabled={actionLoading === gig._id}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                    >
                                        {actionLoading === gig._id ? 'Accepting...' : 'Accept Work'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GigOpportunities;
