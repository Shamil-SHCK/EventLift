import { useState, useEffect } from 'react';
import { getCurrentUser, logoutUser, createEvent, getEvents } from '../services/api';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { Rocket, Target, DollarSign, Calendar, Plus, X, Upload, MapPin, Tag, Clock } from 'lucide-react';

const ClubDashboard = () => {
    const [user, setUser] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showSponsorsModal, setShowSponsorsModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleViewSponsors = (event) => {
        setSelectedEvent(event);
        setShowSponsorsModal(true);
    };

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        category: 'Technical',
        budget: ''
    });

    const [files, setFiles] = useState({
        poster: null,
        brochure: null
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await getCurrentUser();
                if (userData.role !== 'club-admin') {
                    navigate('/login');
                    return;
                }
                setUser(userData);

                // Fetch Events
                const eventsData = await getEvents();
                // Filter events created by this club
                const myEvents = eventsData.filter(event =>
                    event.organizer && event.organizer._id === userData._id
                );
                setEvents(myEvents);
            } catch (error) {
                console.error('Failed to fetch data', error);
                logoutUser();
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            if (files.poster) data.append('poster', files.poster);
            if (files.brochure) data.append('brochure', files.brochure);

            const newEvent = await createEvent(data);

            // Add to local state (with some mock/default fields to avoid full refresh)
            setEvents([...events, { ...newEvent, organizer: user }]); // Optimistic update

            setShowModal(false);
            setFormData({
                title: '', description: '', date: '', time: '', location: '', category: 'Technical', budget: ''
            });
            setFiles({ poster: null, brochure: null });
            alert('Event Created Successfully!');
        } catch (error) {
            alert(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    // Calculate Stats
    const totalEvents = events.length;
    const totalRaised = events.reduce((sum, event) => sum + (event.raised || 0), 0);
    const activeEvents = events.filter(e => new Date(e.date) >= new Date()).length;

    return (
        <DashboardLayout user={user}>
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold font-heading text-slate-900 mb-2">
                        Club <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Overview</span>
                    </h1>
                    <p className="text-slate-500 text-lg">Manage your events and sponsorships.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all"
                >
                    <Plus className="w-5 h-5" /> New Event
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4">
                        <Rocket className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{totalEvents}</h3>
                    <p className="text-slate-500 font-medium text-sm">Total Events</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">₹{totalRaised.toLocaleString()}</h3>
                    <p className="text-slate-500 font-medium text-sm">Funds Raised</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                        <Target className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">0</h3>
                    <p className="text-slate-500 font-medium text-sm">Proposals Sent</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{activeEvents}</h3>
                    <p className="text-slate-500 font-medium text-sm">Upcoming</p>
                </div>
            </div>

            {/* Event List */}
            {events.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Rocket className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Create Your First Event</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-6">Start by creating an event to attract sponsors and manage your fundraising campaigns effectively.</p>
                    <button onClick={() => setShowModal(true)} className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                        Create Event
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map(event => (
                        <div key={event._id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all group">
                            <div className="h-48 bg-slate-100 relative overflow-hidden">
                                {event.poster ? (
                                    <img src={`http://localhost:5000/${event.poster}`} alt={event.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                                        <Rocket className="w-12 h-12" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider text-slate-700">
                                    {event.category}
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold font-heading text-slate-900 mb-2 truncate" title={event.title}>{event.title}</h3>
                                <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                                    <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(event.date).toLocaleDateString()}</div>
                                    <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.location}</div>
                                </div>
                                <div className="mb-6">
                                    <div className="flex justify-between text-sm font-semibold mb-1">
                                        <span className="text-slate-700">₹{event.raised || 0} raised</span>
                                        <span className="text-slate-400">Target: ₹{event.budget}</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 rounded-full"
                                            style={{ width: `${Math.min(100, ((event.raised || 0) / event.budget) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleViewSponsors(event)}
                                        className="flex-1 py-2.5 rounded-lg border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                                    >
                                        Sponsors
                                    </button>
                                    <button className="flex-1 py-2.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors">
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View Sponsors Modal */}
            {showSponsorsModal && selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-2xl relative shadow-2xl animate-fadeIn my-8">
                        <button
                            onClick={() => setShowSponsorsModal(false)}
                            className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8 border-b border-slate-100">
                            <h2 className="text-2xl font-bold font-heading text-slate-900">Sponsors</h2>
                            <p className="text-slate-500">Companies supporting <strong>{selectedEvent.title}</strong>.</p>
                        </div>

                        <div className="p-8">
                            {selectedEvent.sponsors && selectedEvent.sponsors.length > 0 ? (
                                <div className="space-y-4">
                                    {selectedEvent.sponsors.map((s, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 text-slate-400 font-bold overflow-hidden">
                                                    {s.sponsor?.logoUrl ? <img src={s.sponsor.logoUrl} alt="logo" className="w-full h-full object-cover" /> : (s.sponsor?.organizationName?.[0] || 'C')}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900">{s.sponsor?.organizationName || s.sponsor?.name || 'Unknown Sponsor'}</h4>
                                                    <p className="text-xs text-slate-500">{new Date(s.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-green-600">+₹{s.amount.toLocaleString()}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-500">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                        <DollarSign className="w-8 h-8" />
                                    </div>
                                    <p>No sponsors yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Event Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl relative shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8 border-b border-slate-100">
                            <h2 className="text-2xl font-bold font-heading text-slate-900">Create New Event</h2>
                            <p className="text-slate-500">Share your event details to attract sponsors.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 col-span-2">
                                    <label className="text-sm font-bold text-slate-700">Event Title</label>
                                    <input
                                        type="text" name="title" required
                                        value={formData.title} onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                                        placeholder="e.g. TechNova 2025"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                        <input
                                            type="date" name="date" required
                                            value={formData.date} onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Time</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                        <input
                                            type="time" name="time" required
                                            value={formData.time} onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text" name="location" required
                                            value={formData.location} onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                                            placeholder="e.g. Main Auditorium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Category</label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                        <select
                                            name="category" required
                                            value={formData.category} onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all appearance-none"
                                        >
                                            <option value="Technical">Technical</option>
                                            <option value="Cultural">Cultural</option>
                                            <option value="Sports">Sports</option>
                                            <option value="Workshop">Workshop</option>
                                            <option value="Seminar">Seminar</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <label className="text-sm font-bold text-slate-700">Description</label>
                                    <textarea
                                        name="description" required
                                        value={formData.description} onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all min-h-[100px]"
                                        placeholder="Describe your event highlights..."
                                    />
                                </div>

                                <div className="space-y-2 col-span-2">
                                    <label className="text-sm font-bold text-slate-700">Budget Goal (₹)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                        <input
                                            type="number" name="budget" required min="0"
                                            value={formData.budget} onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                                            placeholder="50000"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Event Poster</label>
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                            <p className="text-xs text-slate-500">{files.poster ? files.poster.name : "Upload Image"}</p>
                                        </div>
                                        <input type="file" name="poster" onChange={handleFileChange} accept="image/*" className="hidden" />
                                    </label>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Sponsorship Brochure (PDF)</label>
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                            <p className="text-xs text-slate-500">{files.brochure ? files.brochure.name : "Upload PDF"}</p>
                                        </div>
                                        <input type="file" name="brochure" onChange={handleFileChange} accept=".pdf" className="hidden" />
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-70"
                            >
                                {submitting ? 'Creating Event...' : 'Launch Event'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default ClubDashboard;
