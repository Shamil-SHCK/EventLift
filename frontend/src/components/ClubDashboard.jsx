import { useState, useEffect } from 'react';
import { getCurrentUser, logoutUser, createEvent, updateEvent, deleteEvent, getDashboardStats, getLatestEvents, getMyEvents } from '../services/api';
import { getAcceptedGigs, markGigComplete } from '../services/api/gigService';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { Rocket, DollarSign, Calendar, Plus, Briefcase, X } from 'lucide-react';
import ClubEventList from './ClubEventList';
import CreateEventModal from './CreateEventModal';

const ClubDashboard = () => {
    const [user, setUser] = useState(null);
    const [events, setEvents] = useState([]);
    const [acceptedGigs, setAcceptedGigs] = useState([]);
    const [loading, setLoading] = useState(true);
    // const [stats, setStats] = useState(null); // Unused
    // const [latestEvents, setLatestEvents] = useState([]); // Unused

    const [showModal, setShowModal] = useState(false);
    const [showSponsorsModal, setShowSponsorsModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const navigate = useNavigate();

    const [viewMode, setViewMode] = useState('events'); // 'events' or 'gigs'

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

                // Initialize empty arrays to prevent mapping errors if calls fail
                setEvents([]);
                setAcceptedGigs([]);

                // Parallel Fetching
                const [eventsData, gigsData] = await Promise.all([
                    getMyEvents(),
                    getAcceptedGigs()
                ]);

                setEvents(eventsData);
                setAcceptedGigs(gigsData);

            } catch (error) {
                console.error('Failed to fetch data', error);
                // Don't logout immediately on data fetch error to allow debugging, unless unauthorized (handled in api.js usually)
                if (error.response && error.response.status === 401) {
                    logoutUser();
                    navigate('/login');
                }
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

            if (isEditing) {
                const updatedEvent = await updateEvent(editId, data);
                setEvents(events.map(e => e._id === editId ? { ...updatedEvent, organizer: user } : e));
                alert('Event Updated Successfully!');
            } else {
                const newEvent = await createEvent(data);
                setEvents([...events, { ...newEvent, organizer: user }]);
                alert('Event Created Successfully!');
            }

            handleCloseModal();
        } catch (error) {
            alert(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditEvent = (event) => {
        setIsEditing(true);
        setEditId(event._id);
        setFormData({
            title: event.title,
            description: event.description,
            date: event.date ? new Date(event.date).toISOString().split('T')[0] : '', // Format date for input
            time: event.time || '',
            location: event.location,
            category: event.category,
            budget: event.budget
        });
        // We can't pre-fill file inputs for security, but backend will keep old ones if not sent
        setFiles({ poster: null, brochure: null });
        setShowModal(true);
    };

    const handleDeleteEvent = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                setLoading(true)
                await deleteEvent(eventId);
                setEvents(events.filter(e => e._id !== eventId));
            } catch (error) {
                console.error(error);
                alert('Failed to delete event');
            } finally {
                setLoading(false)
            }
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setIsEditing(false);
        setEditId(null);
        setFormData({
            title: '', description: '', date: '', time: '', location: '', category: 'Technical', budget: ''
        });
        setFiles({ poster: null, brochure: null });
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

    // Separate events
    const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date));
    const pastEvents = events.filter(e => new Date(e.date) < new Date()).sort((a, b) => new Date(b.date) - new Date(a.date));


    const handleMarkGigDone = async (gigId) => {
        if (window.confirm('Are you sure you want to mark this gig as done?')) {
            try {
                const updatedGig = await markGigComplete(gigId);
                setAcceptedGigs(acceptedGigs.map(g => g._id === gigId ? { ...g, status: 'completed' } : g));
            } catch (error) {
                console.error(error);
                alert('Failed to update gig status');
            }
        }
    };

    const AcceptedGigsSection = () => (
        <div className="mt-8">
            <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-indigo-600" />
                Accepted <span className="text-indigo-600">Gigs</span>
            </h2>

            {acceptedGigs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {acceptedGigs.map(gig => (
                        <div key={gig._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col">
                            {gig.status === 'completed' && (
                                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                                    COMPLETED
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1 mb-1">{gig.title}</h3>
                                    <p className="text-sm text-slate-500 font-medium">
                                        by <span className="text-indigo-600">{gig.company?.organizationName || gig.company?.name || 'Unknown Company'}</span>
                                    </p>
                                </div>
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full text-nowrap ml-2">
                                    {gig.category}
                                </span>
                            </div>

                            <p className="text-slate-600 text-sm mb-6 line-clamp-2 leading-relaxed">{gig.description}</p>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                                <div className="font-bold text-slate-900 text-lg">₹{gig.budget.toLocaleString()}</div>
                                {gig.status !== 'completed' && (
                                    <button
                                        onClick={() => handleMarkGigDone(gig._id)}
                                        className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition-colors shadow-sm shadow-green-200"
                                    >
                                        Mark Done
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center">
                    <p className="text-slate-500">You haven't accepted any gigs yet.</p>
                    <button onClick={() => navigate('/club/gig-opportunities')} className="text-indigo-600 font-bold hover:underline mt-2">Browse Gigs</button>
                </div>
            )}
        </div>
    );

    return (
        <DashboardLayout user={user}>
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold font-heading text-slate-900 mb-2">
                        Club <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Overview</span>
                    </h1>
                    <p className="text-slate-500 text-lg">Manage your events and sponsorships.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => { setIsEditing(false); setShowModal(true); }}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-1 transition-all"
                    >
                        <Plus className="w-5 h-5" /> New Event
                    </button>
                </div>
            </div>

            {/* Custom Stats Grid for Funds */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                {/* Total Fund Raised Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">₹{totalRaised.toLocaleString()}</h3>
                    <p className="text-slate-500 font-medium text-sm">Total Funds Raised</p>
                </div>

                {/* Total Events Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{totalEvents}</h3>
                    <p className="text-slate-500 font-medium text-sm">Total Events</p>
                </div>

                {/* Active Events Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                        <Rocket className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{activeEvents}</h3>
                    <p className="text-slate-500 font-medium text-sm">Active Events</p>
                </div>
                {/* Pending Gigs Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{acceptedGigs.filter(g => g.status !== 'completed').length}</h3>
                    <p className="text-slate-500 font-medium text-sm">Active Gigs</p>
                </div>
            </div>

            {/* View Toggle */}
            <div className="flex mb-8">
                <div className="bg-blue-600 p-1 rounded-xl inline-flex shadow-inner">
                    <button
                        onClick={() => setViewMode('events')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${viewMode === 'events'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-blue-100 hover:bg-white/10'
                            }`}
                    >
                        Your Events
                    </button>
                    <button
                        onClick={() => setViewMode('gigs')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${viewMode === 'gigs'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-blue-100 hover:bg-white/10'
                            }`}
                    >
                        Accepted Gigs
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {viewMode === 'events' ? (
                <div className="animate-fadeIn space-y-12">
                    {/* Upcoming Events */}
                    <section>
                        <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6 flex items-center gap-2">
                            <Rocket className="w-6 h-6 text-indigo-600" />
                            Upcoming <span className="text-indigo-600">Events</span>
                        </h2>
                        {upcomingEvents.length > 0 ? (
                            <ClubEventList
                                events={upcomingEvents}
                                handleViewSponsors={handleViewSponsors}
                                handleEditEvent={handleEditEvent}
                                handleDeleteEvent={handleDeleteEvent}
                                openCreateModal={() => { setIsEditing(false); setShowModal(true); }}
                            />
                        ) : (
                            <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-200">
                                <p className="text-slate-500">No upcoming events found.</p>
                                <button onClick={() => { setIsEditing(false); setShowModal(true); }} className="text-indigo-600 font-bold hover:underline mt-2">Create one now</button>
                            </div>
                        )}
                    </section>

                    {/* Past Events */}
                    {pastEvents.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6 flex items-center gap-2 opacity-75">
                                <Calendar className="w-6 h-6 text-slate-500" />
                                Past <span className="text-slate-500">Events</span>
                            </h2>
                            <div className="opacity-80">
                                <ClubEventList
                                    events={pastEvents}
                                    handleViewSponsors={handleViewSponsors}
                                    handleEditEvent={handleEditEvent}
                                    handleDeleteEvent={handleDeleteEvent}
                                    openCreateModal={() => { setIsEditing(false); setShowModal(true); }}
                                />
                            </div>
                        </section>
                    )}
                </div>
            ) : (
                <div className="animate-fadeIn">
                    <AcceptedGigsSection />
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
                                                    {s.sponsor.logoUrl ? <img src={s.sponsor.logoUrl} alt="logo" className="w-full h-full object-cover" /> : (s.name ? s.name[0] : 'C')}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900">{s.name ? s.name : 'Unknown Sponsor'}</h4>
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
            <CreateEventModal
                isOpen={showModal}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                isEditing={isEditing}
                formData={formData}
                handleInputChange={handleInputChange}
                files={files}
                handleFileChange={handleFileChange}
                submitting={submitting}
            />
        </DashboardLayout>
    );
};
export default ClubDashboard;
