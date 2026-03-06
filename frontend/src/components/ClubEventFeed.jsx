import { useState, useEffect } from 'react';
import { getEvents, getEventById } from '../services/api';
import { Rocket, Calendar, MapPin, Search } from 'lucide-react';

// Club Feed - View Only (Clubs generally don't sponsor others in this context, but can see them)
// Removing sponsorship buttons to distinguish it.
const ClubEventFeed = () => {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);

    // PDF Preview Modal State
    const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await getEventById();
                setEvents(data);
                setFilteredEvents(data);
                console.log(data);
                console.log(events);
            } catch (error) {
                console.error('Failed to fetch events', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    useEffect(() => {
        let result = events;

        if (searchQuery) {
            result = result.filter(e =>
                e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (e.organizer?.clubName && e.organizer.clubName.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        if (selectedCategory !== 'All') {
            result = result.filter(e => e.category === selectedCategory);
        }
        setFilteredEvents(result);
    }, [searchQuery, selectedCategory, events]);


    if (loading) return (
        <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    const categories = ['All', 'Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Other'];

    return (
        <div className="space-y-8">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${selectedCategory === cat
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map(event => (
                    <div key={event._id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all group flex flex-col h-full">
                        <div className="h-48 bg-slate-100 relative overflow-hidden">
                            {event.poster ? (
                                <img src={`${event.poster}`} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                                    <Rocket className="w-12 h-12" />
                                </div>
                            )}
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider text-slate-700 shadow-sm">
                                {event.category}
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                <p className="text-white font-semibold text-sm flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-white/20 backdrop-blur flex items-center justify-center overflow-hidden border border-white/50">
                                        {event.organizer?.logoUrl ? (
                                            <img src={event.organizer.logoUrl} alt="club" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xs">{event.organizer?.clubName?.[0] || 'C'}</span>
                                        )}
                                    </span>
                                    {event.organizer?.clubName || 'Unknown Club'}
                                </p>
                            </div>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold font-heading text-slate-900 mb-2">{event.title}</h3>
                            <p className="text-slate-500 text-sm mb-4 line-clamp-2">{event.description}</p>

                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Calendar className="w-4 h-4 text-blue-500" />
                                    <span>{new Date(event.date).toLocaleDateString()} @ {event.time}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <MapPin className="w-4 h-4 text-red-500" />
                                    <span>{event.location}</span>
                                </div>
                            </div>

                            <div className="mt-auto">
                                <div className="flex justify-between text-sm font-semibold mb-1">
                                    <span className="text-slate-700">₹{event.raised || 0} raised</span>
                                    <span className="text-slate-400">Target: ₹{event.budget}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-6">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                                        style={{ width: `${Math.min(100, ((event.raised || 0) / event.budget) * 100)}%` }}
                                    ></div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {event.poster && (
                                        <a
                                            href={`${event.poster}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors text-center ${!event.brochure ? 'col-span-2' : ''}`}
                                        >
                                            View Poster
                                        </a>
                                    )}
                                    {event.brochure && (
                                        <button
                                            onClick={() => setPreviewPdfUrl((event.brochure.startsWith('http') ? event.brochure : (event.brochure.startsWith('res.cloudinary') ? `https://${event.brochure}` : event.brochure)).replace('/upload/fl_attachment/', '/upload/'))}
                                            className={`px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors text-center ${!event.poster ? 'col-span-2' : ''}`}
                                        >
                                            View Brochure
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredEvents.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border dashed border-slate-200">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 shadow-sm">
                        <Search className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No events found</h3>
                    <p className="text-slate-500">Try adjusting your filters or search query.</p>
                </div>
            )}

            {/* PDF Preview Modal */}
            {previewPdfUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-6 overflow-hidden">
                    <div className="bg-white rounded-2xl w-full h-full max-w-6xl shadow-2xl animate-fadeIn flex flex-col relative">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-2xl flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-900">Document Viewer</h2>
                            <div className="flex items-center gap-3">
                                <a
                                    href={previewPdfUrl.replace('/upload/', '/upload/fl_attachment/')}
                                    download
                                    className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition"
                                >
                                    Download File
                                </a>
                                <button
                                    onClick={() => setPreviewPdfUrl(null)}
                                    className="p-2 bg-slate-200 hover:bg-slate-300 rounded-full text-slate-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 bg-slate-100 relative w-full h-full">
                            <iframe
                                src={`https://docs.google.com/viewer?url=${encodeURIComponent(previewPdfUrl)}&embedded=true`}
                                title="PDF Document Viewer"
                                className="absolute inset-0 w-full h-full border-0"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClubEventFeed;
