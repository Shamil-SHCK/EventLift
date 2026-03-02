import { useState, useEffect } from 'react';
import { fetchClubsDirectory } from '../services/api';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { Users, Search, Building2, MapPin, ExternalLink } from 'lucide-react';

const ClubDirectory = () => {
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const loadClubs = async () => {
            try {
                const data = await fetchClubsDirectory();
                setClubs(data);
            } catch (error) {
                console.error('Failed to fetch clubs directory', error);
            } finally {
                setLoading(false);
            }
        };
        loadClubs();
    }, []);

    const filteredClubs = clubs.filter(club =>
        club.clubName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.collegeName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold font-heading text-slate-900 mb-2">
                    Club <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Directory</span>
                </h1>
                <p className="text-slate-500 text-lg mb-6">Discover and connect with student organizations.</p>

                {/* Search Bar */}
                <div className="relative max-w-2xl mb-10">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow shadow-sm"
                        placeholder="Search by club name or college..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {filteredClubs.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center shadow-sm">
                        <Users className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No clubs found</h3>
                        <p className="text-slate-500">We couldn't find any clubs matching your criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredClubs.map(club => (
                            <div key={club._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all group flex flex-col">
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-indigo-50 flex items-center justify-center flex-shrink-0 border border-indigo-100">
                                            {club.logoUrl ? (
                                                <img src={club.logoUrl} alt={club.clubName} className="w-full h-full object-cover" />
                                            ) : (
                                                <Building2 className="w-8 h-8 text-indigo-400" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 line-clamp-1">{club.clubName}</h3>
                                            <div className="flex items-center text-slate-500 text-sm mt-1">
                                                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                                                <span className="line-clamp-1 font-medium">{club.collegeName}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-slate-600 text-sm line-clamp-3 mb-6 flex-1">
                                        {club.description || 'No description provided.'}
                                    </p>

                                    <button
                                        onClick={() => navigate(`/clubs/${club._id}`)}
                                        className="w-full bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold py-2.5 rounded-xl border border-slate-200 hover:border-blue-200 transition-colors flex items-center justify-center gap-2 mt-auto"
                                    >
                                        View Public Profile
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ClubDirectory;
