import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProfileByUsername } from '../services/api';
import DashboardLayout from './DashboardLayout';
import {
    User as UserIcon,
    Calendar,
    ArrowLeft,
    Image as ImageIcon,
    Rocket,
    MapPin,
    AtSign,
    Building2,
    Heart,
    GraduationCap,
    Briefcase,
    Mail,
    Phone,
    Award
} from 'lucide-react';

const PublicProfile = () => {
    const { username } = useParams();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await fetchProfileByUsername(username);
                setProfile(data);
            } catch (err) {
                setError(err.message || 'User not found');
            } finally {
                setLoading(false);
            }
        };
        load();

        // Load user for sidebar
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) setUser(JSON.parse(userStr));
        } catch (err) {
            console.error('Failed to load user from localStorage', err);
        }
    }, [username]);

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
    );

    if (error) return (
        <DashboardLayout user={user}>
            <div className="max-w-3xl mx-auto py-12 text-center">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
                    <UserIcon className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">User not found</h2>
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

    const logoUrl = profile.profile?.logoUrl || null;
    const clubName = profile.profile?.clubName || null;
    const events = profile.events || [];
    const gallery = profile.gallery || [];

    const getRoleLabel = (role) => {
        switch (role) {
            case 'club-admin': return 'Club';
            case 'alumni-individual': return 'Alumni';
            case 'company': return 'Company';
            case 'administrator': return 'Admin';
            default: return role;
        }
    };

    return (
        <DashboardLayout user={user}>
            <div className="max-w-5xl mx-auto pb-12">
                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-10">
                    <div className="h-32 md:h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                    </div>
                    <div className="px-6 md:px-10 pb-8">
                        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-14 sm:-mt-16 mb-5 relative z-10">
                            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-white bg-white shadow-xl flex items-center justify-center shrink-0">
                                {logoUrl ? (
                                    <img src={logoUrl} alt={profile.name} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-14 h-14 text-indigo-300" />
                                )}
                            </div>
                            <div className="flex-1 pb-1">
                                <h1 className="text-2xl md:text-4xl font-bold font-heading text-slate-900 mb-1">
                                    {clubName || profile.name}
                                </h1>
                                <div className="flex flex-wrap items-center gap-3 text-slate-500 text-sm">
                                    <span className="flex items-center gap-1 font-semibold text-indigo-600">
                                        <AtSign className="w-4 h-4" />{profile.username}
                                    </span>
                                    <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold border border-blue-100">
                                        {getRoleLabel(profile.role)}
                                    </span>
                                    {profile.profile?.collegeName && (
                                        <span className="flex items-center gap-1">
                                            <Building2 className="w-4 h-4" /> {profile.profile.collegeName}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {profile.profile?.description && (
                            <p className="text-slate-600 text-base leading-relaxed bg-slate-50 rounded-xl p-5 border border-slate-100">
                                {profile.profile.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Alumni Specific Section */}
                {profile.role === 'alumni-individual' && (
                    <div className="space-y-10">
                        {/* Stats Card */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5">
                                <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                                    <Heart className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-slate-900">₹{profile.totalContribution?.toLocaleString() || 0}</p>
                                    <p className="text-slate-500 text-sm font-medium">Total Contributed</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5">
                                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                                    <Award className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-slate-900">{profile.eventsSupportedCount || 0}</p>
                                    <p className="text-slate-500 text-sm font-medium">Events Supported</p>
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-blue-600" /> Education & Background
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <Building2 className="w-5 h-5 text-slate-400 shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Former Institution</p>
                                            <p className="text-slate-500">{profile.profile?.formerInstitution || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-indigo-600" /> Professional Info
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex gap-3">
                                        <Briefcase className="w-5 h-5 text-slate-400 shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Currently Working At</p>
                                            <p className="text-slate-500">
                                                {profile.profile?.organizationName || 'Not specified'}
                                                {profile.profile?.occupation && ` — ${profile.profile.occupation}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <Mail className="w-5 h-5 text-emerald-600" /> Contact Information
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="flex gap-3">
                                        <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Email Address</p>
                                            <p className="text-slate-500">{profile.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Phone className="w-5 h-5 text-slate-400 shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Phone Number</p>
                                            <p className="text-slate-500">{profile.profile?.phone || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Events Section (Hidden for Alumni) */}
                {profile.role !== 'alumni-individual' && (
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold font-heading text-slate-900 flex items-center gap-3">
                                <Calendar className="w-7 h-7 text-blue-600" /> Events
                            </h2>
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold rounded-full text-sm border border-blue-100">
                                {events.length} Listed
                            </span>
                        </div>

                        {events.length === 0 ? (
                            <div className="bg-white p-10 rounded-2xl border border-slate-100 text-center shadow-sm">
                                <Calendar className="w-14 h-14 mx-auto text-slate-300 mb-4" />
                                <h3 className="text-lg font-bold text-slate-900 mb-1">No Events</h3>
                                <p className="text-slate-500 text-sm">This user hasn't listed any events yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {events.map(event => (
                                    <div key={event._id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all group flex flex-col">
                                        <div className="h-40 bg-slate-100 relative overflow-hidden">
                                            {event.poster ? (
                                                <img src={event.poster} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                                                    <Rocket className="w-10 h-10" />
                                                </div>
                                            )}
                                            {event.category && (
                                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider text-slate-700 shadow-sm">
                                                    {event.category}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <h3 className="text-lg font-bold font-heading text-slate-900 mb-1 line-clamp-1">{event.title}</h3>
                                            <p className="text-slate-500 text-sm mb-3 line-clamp-2">{event.description}</p>
                                            <div className="mt-auto space-y-1.5">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Calendar className="w-4 h-4 text-blue-500" />
                                                    <span>{new Date(event.date).toLocaleDateString()}</span>
                                                </div>
                                                {event.location && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <MapPin className="w-4 h-4 text-red-500" />
                                                        <span className="line-clamp-1">{event.location}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Gallery Section (Hidden for Alumni) */}
                {profile.role !== 'alumni-individual' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold font-heading text-slate-900 flex items-center gap-3">
                                <ImageIcon className="w-7 h-7 text-indigo-500" /> Gallery
                            </h2>
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-full text-sm border border-indigo-100">
                                {gallery.length} Photos
                            </span>
                        </div>

                        {gallery.length === 0 ? (
                            <div className="bg-slate-50 p-10 rounded-2xl border border-dashed border-slate-300 text-center">
                                <ImageIcon className="w-14 h-14 mx-auto text-slate-300 mb-4" />
                                <h3 className="text-lg font-bold text-slate-900 mb-1">No Photos Yet</h3>
                                <p className="text-slate-500 text-sm">No gallery images have been uploaded.</p>
                            </div>
                        ) : (
                            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                                {gallery.map(img => (
                                    <div key={img.id} className="break-inside-avoid shadow-sm hover:shadow-xl transition-all rounded-xl overflow-hidden group bg-white border border-slate-100 relative">
                                        <img src={img.url} alt={img.caption || 'Gallery'} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
                                        {img.caption && (
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-10">
                                                <p className="text-white text-sm font-medium leading-snug">{img.caption}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default PublicProfile;
