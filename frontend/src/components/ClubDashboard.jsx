import { useState, useEffect } from 'react';
import { getCurrentUser, logoutUser, createEvent, getEvents, updateEvent, deleteEvent, updateUserProfile } from '../services/api';
import { uploadLogoImage } from '../services/api/auth';
import { getAcceptedGigs, submitWork } from '../services/api/gigService';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { Rocket, IndianRupee, Calendar, Plus, Briefcase, X, Clock, Users, Award, Upload, Trash2, Save, CheckCircle, MessageSquare } from 'lucide-react';
import ClubEventList from './ClubEventList';
import CreateEventModal from './CreateEventModal';

const ClubDashboard = () => {
    const [user, setUser] = useState(null);
    const [events, setEvents] = useState([]);
    const [acceptedGigs, setAcceptedGigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showSponsorsModal, setShowSponsorsModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formError, setFormError] = useState(null);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [submissionNote, setSubmissionNote] = useState('');
    const [submissionFile, setSubmissionFile] = useState(null);
    const [selectedGig, setSelectedGig] = useState(null);
    const [toast, setToast] = useState(null);
    const [modalError, setModalError] = useState(null);
    const [memberError, setMemberError] = useState(null);
    const [showRemarksModal, setShowRemarksModal] = useState(false);

    const [viewMode, setViewMode] = useState('events'); // 'events', 'gigs', or 'profile'
    const navigate = useNavigate();

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    // Team & Achievements state
    const [team, setTeam] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileSaved, setProfileSaved] = useState(false);
    const [newMember, setNewMember] = useState({ name: '', role: '', photoUrl: '' });
    const [newMemberPhotoFile, setNewMemberPhotoFile] = useState(null);
    const [newAchievement, setNewAchievement] = useState({ title: '', year: '', description: '' });

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
        categoryOther: '',
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
                setTeam(userData.profile?.team || userData.team || []);
                setAchievements(userData.profile?.achievements || userData.achievements || []);

                // Fetch Events
                const eventsData = await getEvents();

                // Filter events created by this club
                const myEvents = eventsData.filter(event => {
                    if (!event.organizer) return false;

                    // Check Logic 1: ID Match
                    const orgId = typeof event.organizer === 'object' ? event.organizer._id : event.organizer;
                    const idMatch = String(orgId) === String(userData._id);

                    // Check Logic 2: Club Name Match (Fallback)
                    const orgClubName = typeof event.organizer === 'object' ? event.organizer.clubName : null;
                    const nameMatch = userData.clubName && orgClubName && userData.clubName === orgClubName;

                    return idMatch || nameMatch;
                });
                setEvents(myEvents);

                // Fetch Accepted Gigs
                const gigsData = await getAcceptedGigs();
                setAcceptedGigs(gigsData);

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
        setFormError(null);
        
        // File Validations
        if (files.poster) {
            if (!files.poster.type.startsWith('image/')) {
                setFormError('Event poster must be an image file');
                return;
            }
            if (files.poster.size > 5 * 1024 * 1024) {
                setFormError('Poster size must be less than 5MB');
                return;
            }
        }
        if (files.brochure) {
            if (files.brochure.type !== 'application/pdf') {
                setFormError('Sponsorship brochure must be a PDF file');
                return;
            }
            if (files.brochure.size > 5 * 1024 * 1024) {
                setFormError('Brochure size must be less than 5MB');
                return;
            }
        }

        setSubmitting(true);
        setFormError(null);

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'category' && formData.category === 'Other') {
                    data.append('category', formData.categoryOther || 'Other');
                } else if (key !== 'categoryOther') {
                    data.append(key, formData[key]);
                }
            });
            if (files.poster) data.append('poster', files.poster);
            if (files.brochure) data.append('brochure', files.brochure);

            if (isEditing) {
                const updatedEvent = await updateEvent(editId, data);
                setEvents(events.map(e => e._id === editId ? { ...updatedEvent, organizer: user } : e));
                showToast('success', 'Event updated successfully!');
            } else {
                const newEvent = await createEvent(data);
                setEvents([...events, { ...newEvent, organizer: user }]);
                showToast('success', 'Event created successfully!');
            }

            handleCloseModal();
        } catch (error) {
            setFormError(error.message);
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
                showToast('success', 'Event deleted.');
            } catch (error) {
                console.error(error);
                showToast('error', 'Failed to delete event.');
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
        setFormError(null);
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    // Calculate Stats
    const totalEvents = events.length;
    const totalGigs = acceptedGigs.length;
    const totalRaised = events.reduce((sum, event) => sum + (event.raised || 0), 0) +
        acceptedGigs.reduce((sum, gig) => sum + (gig.budget || 0), 0); // Assuming raised includes gig budget too, or just event raised? User said "total fund raised", usually implies all money. But let's stick to what was there and maybe add gig budget if that counts as funds raised. For now, I'll stick to event raised + gig budget to be safe as "funds raised". 
    // Actually, looking at previous code: const totalRaised = events.reduce((sum, event) => sum + (event.raised || 0), 0);
    // Events have 'raised' (sponsorships). Gigs have 'budget' (payment). 
    // I will sum both for "Total Fund Raised" as it makes sense for a club.

    // Re-calculating properly
    const totalFunds = events.reduce((sum, event) => sum + (event.raised || 0), 0) +
        acceptedGigs.reduce((sum, gig) => sum + (gig.budget || 0), 0);

    const activeEvents = events.filter(e => new Date(e.date) >= new Date()).length;
    const pendingGigs = acceptedGigs.filter(g => g.status !== 'completed').length;

    const handleSubmitWork = async (e) => {
        e.preventDefault();
        setModalError(null);
        
        // Validation
        if (!submissionFile) {
            setModalError('Proof of work file is required');
            return;
        }

        const isImage = submissionFile.type.startsWith('image/');
        const isPDF = submissionFile.type === 'application/pdf';
        if (!isImage && !isPDF) {
            setModalError('Proof must be an image or PDF');
            return;
        }
        if (submissionFile.size > 5 * 1024 * 1024) {
            setModalError('Proof file must be less than 5MB');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('submissionNote', submissionNote);
            formData.append('proof', submissionFile);

            await submitWork(selectedGig._id, formData);
            showToast('success', 'Work submitted successfully!');
            setShowSubmitModal(false);
            setSubmissionNote('');
            setSubmissionFile(null);
            setSelectedGig(null);
            
            // Re-fetch gigs
            const updatedGigs = await getAcceptedGigs();
            setAcceptedGigs(updatedGigs);
        } catch (error) {
            console.error(error);
            setModalError(error.message || 'Failed to submit work.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddMember = async () => {
        if (!newMember.name || !newMember.role) return;
        setMemberError(null);
        let photoUrl = newMember.photoUrl;
        if (newMemberPhotoFile) {
            if (!newMemberPhotoFile.type.startsWith('image/')) {
                setMemberError('Team photo must be an image file');
                return;
            }
            if (newMemberPhotoFile.size > 2 * 1024 * 1024) {
                setMemberError('Team photo must be less than 2MB');
                return;
            }
            const fd = new FormData();
            fd.append('logo', newMemberPhotoFile);
            const data = await uploadLogoImage(fd);
            photoUrl = data.url || '';
        }
        setTeam([...team, { name: newMember.name, role: newMember.role, photoUrl }]);
        setNewMember({ name: '', role: '', photoUrl: '' });
        setNewMemberPhotoFile(null);
    };

    const handleRemoveMember = (idx) => setTeam(team.filter((_, i) => i !== idx));

    const handleAddAchievement = () => {
        if (!newAchievement.title) return;
        setAchievements([...achievements, { ...newAchievement }]);
        setNewAchievement({ title: '', year: '', description: '' });
    };

    const handleRemoveAchievement = (idx) => setAchievements(achievements.filter((_, i) => i !== idx));

    const handleSaveProfile = async () => {
        setProfileSaving(true);
        try {
            await updateUserProfile({ team, achievements });
            setProfileSaved(true);
            setTimeout(() => setProfileSaved(false), 3000);
        } catch (e) {
            showToast('error', 'Failed to save profile: ' + e.message);
        } finally {
            setProfileSaving(false);
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
                                
                                <div className="flex items-center gap-2">
                                    {/* View Remarks Button - Enabled if status is not 'assigned' (meaning at least one submission exists) */}
                                    <button
                                        onClick={() => { setSelectedGig(gig); setShowRemarksModal(true); }}
                                        disabled={gig.status === 'assigned'}
                                        className="px-3 py-2 border border-slate-200 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        title={gig.status === 'assigned' ? 'No remarks yet' : 'View company remarks'}
                                    >
                                        Remarks
                                    </button>

                                    {gig.status === 'assigned' || gig.status === 'revision_requested' ? (
                                        <button
                                            onClick={() => { setSelectedGig(gig); setShowSubmitModal(true); setModalError(null); }}
                                            className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
                                        >
                                            Submit Work
                                        </button>
                                    ) : gig.status === 'submitted' ? (
                                        <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">Submitted for Approval</span>
                                    ) : (gig.status === 'approved' || gig.status === 'paid_to_platform' || gig.status === 'completed') ? (
                                        <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 flex items-center gap-1">
                                            <CheckCircle className="w-3.5 h-3.5" /> Completed
                                        </span>
                                    ) : null}
                                </div>
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
            {/* Inline toast */}
            {toast && (
                <div className={`mb-6 p-4 rounded-xl font-medium flex items-center gap-2 text-sm
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

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4">
                        <Rocket className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{totalEvents}</h3>
                    <p className="text-slate-500 font-medium text-sm">Total Events</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{totalGigs}</h3>
                    <p className="text-slate-500 font-medium text-sm">Total Gigs</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{activeEvents}</h3>
                    <p className="text-slate-500 font-medium text-sm">Upcoming Events</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                        <Clock className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{pendingGigs}</h3>
                    <p className="text-slate-500 font-medium text-sm">Gigs Pending</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
                        <IndianRupee className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-1">₹{totalFunds.toLocaleString()}</h3>
                    <p className="text-slate-500 font-medium text-sm">Total Raised</p>
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

            {viewMode === 'events' ? (
                <div className="mb-8 animate-fadeIn">
                    <h2 className="text-2xl font-bold font-heading text-slate-900 mb-6 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-indigo-600" />
                        Your <span className="text-indigo-600">Events</span>
                    </h2>
                    <ClubEventList
                        events={events}
                        handleViewSponsors={handleViewSponsors}
                        handleEditEvent={handleEditEvent}
                        handleDeleteEvent={handleDeleteEvent}
                        openCreateModal={() => { setIsEditing(false); setShowModal(true); }}
                    />
                </div>
            ) : viewMode === 'gigs' ? (
                <div className="animate-fadeIn">
                    <AcceptedGigsSection />
                </div>
            ) : (
                /* Profile & Team Management */
                <div className="animate-fadeIn space-y-10">
                    {/* Team Members */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold font-heading text-slate-900 flex items-center gap-2">
                                <Users className="w-6 h-6 text-blue-600" /> Team & Leadership
                            </h2>
                            <button
                                onClick={handleSaveProfile}
                                disabled={profileSaving}
                                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 disabled:opacity-60"
                            >
                                <Save className="w-4 h-4" />
                                {profileSaving ? 'Saving…' : profileSaved ? '✓ Saved!' : 'Save Changes'}
                            </button>
                        </div>

                        {/* Existing members */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            {team.map((m, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 relative">
                                    <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-200 shrink-0 border-2 border-white shadow">
                                        {m.photoUrl ? <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 text-xl font-bold">{m.name[0]}</div>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-900 truncate">{m.name}</p>
                                        <p className="text-sm text-indigo-600 font-medium truncate">{m.role}</p>
                                    </div>
                                    <button onClick={() => handleRemoveMember(i)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 transition">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add new member form */}
                        <div className="bg-slate-50 rounded-xl p-5 border border-dashed border-slate-300">
                            <p className="text-sm font-bold text-slate-600 mb-3">Add New Member</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                <input
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                    placeholder="Full Name"
                                    value={newMember.name}
                                    onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                                />
                                <input
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                    placeholder="Role (e.g. President, Faculty Advisor)"
                                    value={newMember.role}
                                    onChange={e => setNewMember({ ...newMember, role: e.target.value })}
                                />
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 font-medium mb-3 w-fit">
                                <Upload className="w-4 h-4" />
                                {newMemberPhotoFile ? newMemberPhotoFile.name : 'Upload Photo (Cloudinary)'}
                                <input type="file" accept="image/*" className="hidden" onChange={e => { setNewMemberPhotoFile(e.target.files[0]); setMemberError(null); }} />
                            </label>
                            
                            {memberError && (
                                <p className="mb-3 text-xs font-bold text-red-600 bg-red-50 p-2 rounded-lg border border-red-100 animate-fadeIn">
                                    ✕ {memberError}
                                </p>
                            )}

                            <button
                                onClick={handleAddMember}
                                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition text-sm"
                            >
                                <Plus className="w-4 h-4" /> Add Member
                            </button>
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                        <h2 className="text-2xl font-bold font-heading text-slate-900 flex items-center gap-2 mb-6">
                            <Award className="w-6 h-6 text-amber-500" /> Club Achievements
                        </h2>

                        <div className="space-y-3 mb-6">
                            {achievements.map((a, i) => (
                                <div key={i} className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100 relative">
                                    <Award className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-900">{a.title} {a.year && <span className="text-amber-600 font-medium text-sm">({a.year})</span>}</p>
                                        {a.description && <p className="text-slate-600 text-sm mt-0.5">{a.description}</p>}
                                    </div>
                                    <button onClick={() => handleRemoveAchievement(i)} className="p-1 text-slate-400 hover:text-red-500 transition shrink-0">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="bg-slate-50 rounded-xl p-5 border border-dashed border-slate-300">
                            <p className="text-sm font-bold text-slate-600 mb-3">Add New Achievement</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                                <input
                                    className="sm:col-span-2 w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-100 focus:border-amber-400 outline-none"
                                    placeholder="Achievement Title (e.g. Won State Hackathon 2024)"
                                    value={newAchievement.title}
                                    onChange={e => setNewAchievement({ ...newAchievement, title: e.target.value })}
                                />
                                <input
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-100 focus:border-amber-400 outline-none"
                                    placeholder="Year (e.g. 2024)"
                                    value={newAchievement.year}
                                    onChange={e => setNewAchievement({ ...newAchievement, year: e.target.value })}
                                />
                            </div>
                            <input
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-100 focus:border-amber-400 outline-none mb-3"
                                placeholder="Short description (optional)"
                                value={newAchievement.description}
                                onChange={e => setNewAchievement({ ...newAchievement, description: e.target.value })}
                            />
                            <button
                                onClick={handleAddAchievement}
                                className="flex items-center gap-2 px-5 py-2 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition text-sm"
                            >
                                <Plus className="w-4 h-4" /> Add Achievement
                            </button>
                        </div>
                    </div>
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
                                        <IndianRupee className="w-8 h-8" />
                                    </div>
                                    <p>No sponsors yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Submit Work Modal */}
            {showSubmitModal && selectedGig && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-fadeIn overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Submit Work</h2>
                                <p className="text-sm text-slate-500">{selectedGig.title}</p>
                            </div>
                            <button onClick={() => setShowSubmitModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmitWork} className="p-6">
                            {selectedGig.status === 'revision_requested' && (
                                <div className="mb-4 bg-red-50 p-4 rounded-xl border border-red-100">
                                    <h4 className="text-sm font-bold text-red-700 mb-1">Company Feedback / Revision Note:</h4>
                                    <p className="text-sm text-red-600 font-medium">
                                        {selectedGig.feedbackHistory && selectedGig.feedbackHistory.length > 0 
                                            ? selectedGig.feedbackHistory[selectedGig.feedbackHistory.length - 1].comment 
                                            : 'Please revise your submission.'}
                                    </p>
                                </div>
                            )}
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-slate-700 mb-2 font-heading">Completion Note (Optional)</label>
                                <textarea
                                    rows="3"
                                    value={submissionNote}
                                    onChange={(e) => setSubmissionNote(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                                    placeholder="Add any details about the completed work..."
                                ></textarea>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 mb-2 font-heading">Upload Proof (Required)</label>
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => {
                                        setSubmissionFile(e.target.files[0]);
                                        setModalError(null);
                                    }}
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer transition-all border border-slate-200 p-2 rounded-xl bg-slate-50"
                                />
                                {submissionFile && <p className="mt-2 text-xs text-slate-500 font-medium ml-1">{submissionFile.name}</p>}
                                
                                {/* Red Error Message below upload */}
                                {modalError && (
                                    <p className="mt-2 text-xs font-bold text-red-600 bg-red-50 p-2 rounded-lg border border-red-100 animate-fadeIn">
                                        ✕ {modalError}
                                    </p>
                                )}
                            </div>
                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
                                <button type="button" onClick={() => setShowSubmitModal(false)} className="px-6 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20">
                                    {submitting ? 'Submitting...' : 'Submit Work'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Event Modal */}
            {/* Remarks / Feedback History Modal */}
            {showRemarksModal && selectedGig && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-lg relative shadow-2xl animate-fadeIn my-8 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Company Remarks</h2>
                                <p className="text-sm text-slate-500">{selectedGig.title}</p>
                            </div>
                            <button
                                onClick={() => setShowRemarksModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto bg-slate-50/30">
                            {selectedGig.feedbackHistory && selectedGig.feedbackHistory.length > 0 ? (
                                <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                                    {selectedGig.feedbackHistory.map((item, index) => (
                                        <div key={index} className="relative pl-8">
                                            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center
                                                ${item.decision === 'approve' ? 'bg-green-500' : 'bg-amber-500'}`}>
                                                {item.decision === 'approve' ? <CheckCircle className="w-3 h-3 text-white" /> : <Clock className="w-3 h-3 text-white" />}
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
                                                        ${item.decision === 'approve' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                                                        {item.decision === 'approve' ? 'Approved' : 'Revision Requested'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold">
                                                        {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                                    {item.comment || 'No specific comment provided.'}
                                                </p>
                                            </div>
                                        </div>
                                    )).reverse()}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-slate-500">
                                    <MessageSquare className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                                    <p className="font-medium text-slate-600">No remarks have been given yet.</p>
                                    <p className="text-xs text-slate-400 mt-1">Once the company reviews your work, you'll see their feedback here.</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-white border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setShowRemarksModal(false)}
                                className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                error={formError}
            />
        </DashboardLayout>
    );
};

export default ClubDashboard;
