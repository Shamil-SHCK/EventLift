import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchClubProfile, fetchClubGallery, createCheckoutSession } from '../services/api';
import DashboardLayout from './DashboardLayout';
import { Building2, MapPin, Calendar, ArrowLeft, Image as ImageIcon, Rocket, DollarSign, X, Check, Trophy, Users, Award, TrendingUp, Star } from 'lucide-react';

const ClubPublicProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [gallery, setGallery] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Sponsorship Modal State
    const [showSponsorModal, setShowSponsorModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [sponsorAmount, setSponsorAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [paymentError, setPaymentError] = useState('');

    // PDF Preview Modal State
    const [previewPdfUrl, setPreviewPdfUrl] = useState(null);

    useEffect(() => {
        const loadProfileData = async () => {
            try {
                const [profileData, galleryData] = await Promise.all([
                    fetchClubProfile(id),
                    fetchClubGallery(id).catch(() => []) // Fallback empty if gallery fails
                ]);
                setProfile(profileData);
                setGallery(galleryData);
            } catch (err) {
                console.error('Failed to fetch profile:', err);
                setError(err.message || 'Failed to load profile or you do not have permission.');
            } finally {
                setLoading(false);
            }
        };
        loadProfileData();
    }, [id]);

    const handleBack = () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user && user.role) {
                    switch (user.role) {
                        case 'administrator':
                            return navigate('/admin/dashboard');
                        case 'company':
                            return navigate('/company/dashboard');
                        case 'club-admin':
                            return navigate('/club/dashboard');
                        case 'alumni-individual':
                            return navigate('/alumni/dashboard');
                    }
                }
            }
        } catch (error) {
            console.error('Error reading role for Navigation:', error);
        }
        navigate('/clubs');
    };

    const handleSponsorClick = (event) => {
        setSelectedEvent(event);
        setSponsorAmount('');
        setPaymentError('');
        setShowSponsorModal(true);
    };

    const handleSponsorSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const data = await createCheckoutSession(selectedEvent._id, Number(sponsorAmount));
            if (data && data.url) {
                window.location.href = data.url;
            } else {
                setPaymentError('Failed to create checkout session');
                setSubmitting(false);
            }
        } catch (error) {
            setPaymentError(error.message || 'An error occurred during payment processing.');
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto py-12 text-center">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
                    <Building2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
                <p className="text-slate-500 mb-6">{error}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 mx-auto text-indigo-600 font-bold hover:text-indigo-700"
                >
                    <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
            </div>
        </DashboardLayout>
    );

    if (!profile) return null;

    // --- Computed Stats ---
    const now = new Date();
    const allEvents = profile.events || [];
    const totalFundsRaised = allEvents.reduce((s, e) => s + (e.raised || 0), 0);
    const pastEvents = allEvents.filter(e => new Date(e.date) < now);
    const ongoingEvents = allEvents.filter(e => new Date(e.date) >= now);
    const allSponsors = allEvents.flatMap(e => (e.sponsors || []).map(s => ({ ...s, eventTitle: e.title })));
    const activeYear = profile.createdAt ? new Date(profile.createdAt).getFullYear() : null;

    // Credibility Badge logic
    const getBadge = () => {
        const score = allEvents.length * 10 + Math.floor(totalFundsRaised / 1000);
        if (score >= 100) return { label: 'Gold Club', color: 'amber', icon: '🥇' };
        if (score >= 40) return { label: 'Silver Club', color: 'slate', icon: '🥈' };
        return { label: 'Bronze Club', color: 'orange', icon: '🥉' };
    };
    const badge = getBadge();

    const badgeColors = {
        amber: 'bg-amber-50 border-amber-200 text-amber-700',
        slate: 'bg-slate-100 border-slate-200 text-slate-700',
        orange: 'bg-orange-50 border-orange-200 text-orange-700',
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto pb-12">
                {/* Back Button */}
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>

                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-12">
                    <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                    </div>
                    <div className="px-6 md:px-10 pb-10">
                        <div className="flex flex-col md:flex-row gap-8 items-start md:items-end -mt-20 md:-mt-24 mb-6 relative z-10">
                            <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden border-4 border-white bg-white shadow-xl flex items-center justify-center shrink-0">
                                {profile.logoUrl ? (
                                    <img src={profile.logoUrl} alt={profile.clubName} className="w-full h-full object-cover" />
                                ) : (
                                    <Building2 className="w-20 h-20 text-indigo-300" />
                                )}
                            </div>
                            <div className="flex-1 pb-2">
                                <h1 className="text-3xl md:text-5xl font-bold font-heading text-slate-900 mb-3">{profile.clubName}</h1>
                                <div className="flex flex-wrap items-center gap-3 text-slate-600 font-medium">
                                    <span className="flex items-center gap-1.5 bg-slate-100 px-4 py-1.5 rounded-full text-sm font-bold text-slate-700 border border-slate-200">
                                        <MapPin className="w-4 h-4 text-indigo-500" />
                                        {profile.collegeName}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Stats Bar */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {[
                                { label: 'Total Events', value: allEvents.length, icon: <Calendar className="w-5 h-5" />, color: 'blue' },
                                { label: 'Funds Raised', value: `₹${totalFundsRaised.toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, color: 'green' },
                                { label: 'Ongoing', value: ongoingEvents.length, icon: <Rocket className="w-5 h-5" />, color: 'indigo' },
                                { label: 'Past Events', value: pastEvents.length, icon: <Trophy className="w-5 h-5" />, color: 'purple' },
                            ].map(stat => (
                                <div key={stat.label} className={`bg-${stat.color}-50 border border-${stat.color}-100 rounded-xl p-4 text-center`}>
                                    <div className={`w-9 h-9 mx-auto mb-2 bg-${stat.color}-100 text-${stat.color}-600 rounded-lg flex items-center justify-center`}>{stat.icon}</div>
                                    <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                                    <p className={`text-xs font-semibold text-${stat.color}-600 mt-0.5`}>{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* About + Badge */}
                        <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-100 shadow-inner">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-bold text-slate-900">About the Club</h3>
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${badgeColors[badge.color]}`}>
                                    {badge.icon} {badge.label}{activeYear ? `  ·  Est. ${activeYear}` : ''}
                                </span>
                            </div>
                            <p className="text-slate-700 leading-relaxed text-lg">
                                {profile.description || 'This club has not provided a description yet.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Interactive Content */}
                <div className="space-y-12">
                    {/* Events Section */}
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold font-heading text-slate-900 flex items-center gap-3">
                                <Calendar className="w-8 h-8 text-blue-600" />
                                Verified Events
                            </h2>
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold rounded-full text-sm border border-blue-100">
                                {profile.events?.length || 0} Listed
                            </span>
                        </div>

                        {!profile.events || profile.events.length === 0 ? (
                            <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center shadow-sm">
                                <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No Active Events</h3>
                                <p className="text-slate-500">This club isn't seeking sponsorship for any events right now.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {profile.events.map(event => (
                                    <div key={event._id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all group flex flex-col h-full">
                                        <div className="h-48 bg-slate-100 relative overflow-hidden">
                                            {event.poster ? (
                                                <img src={event.poster} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                                                    <Rocket className="w-12 h-12" />
                                                </div>
                                            )}
                                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider text-slate-700 shadow-sm">
                                                {event.category}
                                            </div>
                                        </div>

                                        <div className="p-6 flex-1 flex flex-col">
                                            <h3 className="text-xl font-bold font-heading text-slate-900 mb-2 line-clamp-1">{event.title}</h3>
                                            <p className="text-slate-500 text-sm mb-4 line-clamp-2">{event.description}</p>

                                            <div className="space-y-2 mb-6">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Calendar className="w-4 h-4 text-blue-500" />
                                                    <span>{new Date(event.date).toLocaleDateString()} @ {event.time || ''}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <MapPin className="w-4 h-4 text-red-500" />
                                                    <span className="line-clamp-1">{event.location}</span>
                                                </div>
                                            </div>

                                            <div className="mt-auto">
                                                <div className="flex justify-between text-sm font-semibold mb-2">
                                                    <span className="text-slate-700">₹{event.raised || 0} raised</span>
                                                    <span className="text-slate-400">₹{event.budget} goal</span>
                                                </div>
                                                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden mb-6">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out"
                                                        style={{ width: `${Math.min(100, ((event.raised || 0) / event.budget) * 100)}%` }}
                                                    ></div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    {event.poster && (
                                                        <a
                                                            href={event.poster.startsWith('http') ? event.poster : (event.poster.startsWith('res.cloudinary') ? `https://${event.poster}` : event.poster)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`px-4 py-3 rounded-xl border-2 border-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors text-center shadow-sm ${!event.brochure ? 'col-span-2' : ''}`}
                                                        >
                                                            View Poster
                                                        </a>
                                                    )}
                                                    {event.brochure && (
                                                        <button
                                                            onClick={() => setPreviewPdfUrl((event.brochure.startsWith('http') ? event.brochure : (event.brochure.startsWith('res.cloudinary') ? `https://${event.brochure}` : event.brochure)).replace('/upload/fl_attachment/', '/upload/'))}
                                                            className={`px-4 py-3 rounded-xl border-2 border-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors text-center shadow-sm ${!event.poster ? 'col-span-2' : ''}`}
                                                        >
                                                            View Brochure
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleSponsorClick(event)}
                                                        disabled={event.status !== 'open' || (event.raised || 0) >= event.budget || new Date(event.date) < new Date()}
                                                        className="col-span-2 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                                                    >
                                                        {event.status === 'open' && (event.raised || 0) < event.budget && new Date(event.date) >= new Date() ? (
                                                            <>Sponsor Now</>
                                                        ) : ((event.raised || 0) >= event.budget ? 'Fully Funded' : 'Closed')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Past Events Timeline */}
                    {pastEvents.length > 0 && (
                        <div className="pt-8 border-t border-slate-200">
                            <h2 className="text-3xl font-bold font-heading text-slate-900 flex items-center gap-3 mb-8">
                                <TrendingUp className="w-8 h-8 text-purple-600" /> Past Events Track Record
                            </h2>
                            <div className="relative pl-6">
                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-indigo-500 to-transparent" />
                                <div className="space-y-5">
                                    {pastEvents.map(ev => (
                                        <div key={ev._id} className="relative bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition">
                                            <div className="absolute -left-9 top-5 w-4 h-4 rounded-full bg-purple-500 border-2 border-white shadow" />
                                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                                <span className="font-bold text-slate-900">{ev.title}</span>
                                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">{ev.category}</span>
                                            </div>
                                            <p className="text-sm text-slate-500 mb-2">{new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · {ev.location}</p>
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="font-bold text-green-600">₹{(ev.raised || 0).toLocaleString()} raised</span>
                                                <span className="text-slate-400">of ₹{(ev.budget || 0).toLocaleString()} goal</span>
                                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" style={{ width: `${Math.min(100, ((ev.raised || 0) / (ev.budget || 1)) * 100)}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sponsorship Transparency Panel */}
                    {allSponsors.length > 0 && (
                        <div className="pt-8 border-t border-slate-200">
                            <h2 className="text-3xl font-bold font-heading text-slate-900 flex items-center gap-3 mb-8">
                                <Star className="w-8 h-8 text-yellow-500" /> Our Sponsors
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {allSponsors.map((s, i) => (
                                    <div key={i} className="bg-white flex items-center gap-4 p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm shrink-0">
                                            {s.name ? s.name[0] : '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-900 truncate">{s.name || 'Anonymous'}</p>
                                            <p className="text-xs text-slate-500 truncate">{s.eventTitle}</p>
                                        </div>
                                        <span className="font-bold text-green-600 text-sm shrink-0">₹{s.amount?.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Team & Leadership */}
                    {profile.team && profile.team.length > 0 && (
                        <div className="pt-8 border-t border-slate-200">
                            <h2 className="text-3xl font-bold font-heading text-slate-900 flex items-center gap-3 mb-8">
                                <Users className="w-8 h-8 text-blue-600" /> Team & Leadership
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                                {profile.team.map((m, i) => (
                                    <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center hover:shadow-lg transition">
                                        <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 border-4 border-white shadow-md bg-slate-200">
                                            {m.photoUrl
                                                ? <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                                                : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-400">{m.name[0]}</div>
                                            }
                                        </div>
                                        <p className="font-bold text-slate-900 leading-snug">{m.name}</p>
                                        <p className="text-sm text-indigo-600 font-semibold mt-0.5">{m.role}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Club Achievements */}
                    {profile.achievements && profile.achievements.length > 0 && (
                        <div className="pt-8 border-t border-slate-200">
                            <h2 className="text-3xl font-bold font-heading text-slate-900 flex items-center gap-3 mb-8">
                                <Award className="w-8 h-8 text-amber-500" /> Achievements & Milestones
                            </h2>
                            <div className="flex flex-wrap gap-4">
                                {profile.achievements.map((a, i) => (
                                    <div key={i} className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition max-w-xs">
                                        <Award className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-slate-900 leading-snug">{a.title}</p>
                                            {a.year && <span className="text-xs font-bold text-amber-600">{a.year}</span>}
                                            {a.description && <p className="text-slate-500 text-sm mt-1 leading-snug">{a.description}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pt-8 border-t border-slate-200">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold font-heading text-slate-900 flex items-center gap-3">
                                <ImageIcon className="w-8 h-8 text-indigo-500" />
                                Impact Gallery
                            </h2>
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-full text-sm border border-indigo-100">
                                {gallery.length} Photos
                            </span>
                        </div>

                        {gallery.length === 0 ? (
                            <div className="bg-slate-50 p-12 rounded-2xl border border-dashed border-slate-300 text-center">
                                <ImageIcon className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No Impact Photos Yet</h3>
                                <p className="text-slate-500">The club hasn't uploaded any verified post-event photos.</p>
                            </div>
                        ) : (
                            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                                {gallery.map(img => (
                                    <div key={img.id} className="break-inside-avoid shadow-sm hover:shadow-xl transition-all rounded-xl overflow-hidden group bg-white border border-slate-100 relative">
                                        <img src={img.url} alt={img.caption || 'Club Event'} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
                                        {img.caption && (
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pt-12">
                                                <p className="text-white text-sm font-medium leading-snug">{img.caption}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sponsorship Modal - Identical to CompanyEventFeed */}
            {showSponsorModal && selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-md relative shadow-2xl animate-fadeIn my-auto">
                        <button
                            onClick={() => setShowSponsorModal(false)}
                            className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl mt-4">
                            <h2 className="text-xl font-bold font-heading text-slate-900 mb-1">Sponsor Event</h2>
                            <p className="text-slate-500 text-sm">Directly supporting <strong>{selectedEvent.title}</strong></p>
                        </div>

                        <form onSubmit={handleSponsorSubmit} className="p-6 space-y-6">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <div className="flex justify-between items-center text-sm mb-2">
                                    <span className="text-slate-500">Target Budget</span>
                                    <span className="font-bold text-slate-900">₹{selectedEvent.budget.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Already Raised</span>
                                    <span className="font-bold text-green-600">₹{(selectedEvent.raised || 0).toLocaleString()}</span>
                                </div>
                                <div className="mt-3 text-xs text-blue-600 bg-white/50 p-2 rounded-lg font-medium">
                                    💡 Your sponsorship will help them reach their goal!
                                </div>
                            </div>

                            {paymentError && (
                                <div className="p-4 bg-red-50 text-red-700 text-sm font-semibold rounded-xl border border-red-200">
                                    {paymentError}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Sponsorship Amount (₹)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={sponsorAmount}
                                        onChange={(e) => setSponsorAmount(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all text-lg font-bold text-slate-900"
                                        placeholder="Enter amount"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    'Processing...'
                                ) : (
                                    <>
                                        <Check className="w-5 h-5" /> Pay Now
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
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
                                src={`http://localhost:5000/api/events/proxy-pdf?url=${encodeURIComponent(previewPdfUrl)}`}
                                title="PDF Document Viewer"
                                className="absolute inset-0 w-full h-full border-0"
                            />
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default ClubPublicProfile;
