import { useState, useEffect } from 'react';
import { getCurrentUser, updateUserProfile, changeUserPassword } from '../services/api';
import { uploadLogoImage } from '../services/api/auth';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import {
    User,
    Building2,
    Link as LinkIcon,
    Phone,
    FileText,
    Save,
    Lock,
    Loader,
    CheckCircle,
    XCircle,
    Users,
    Award,
    Plus,
    Trash2,
    Upload
} from 'lucide-react';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        clubName: '',
        organizationName: '',
        formerInstitution: '',
        phone: '',
        logoUrl: '',
        description: '',
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Club-admin team & achievements state
    const [team, setTeam] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileSaved, setProfileSaved] = useState(false);
    const [newMember, setNewMember] = useState({ name: '', role: '', photoUrl: '' });
    const [newMemberPhotoFile, setNewMemberPhotoFile] = useState(null);
    const [newAchievement, setNewAchievement] = useState({ title: '', year: '', description: '' });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getCurrentUser();
                setUser(userData);
                setFormData({
                    clubName: userData.clubName || '',
                    organizationName: userData.organizationName || '',
                    formerInstitution: userData.formerInstitution || '',
                    phone: userData.phone || '',
                    logoUrl: userData.logoUrl || '',
                    description: userData.description || '',
                });
                if (userData.role === 'club-admin') {
                    setTeam(userData.team || []);
                    setAchievements(userData.achievements || []);
                }
            } catch (err) {
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    // Team handlers
    const handleAddMember = async () => {
        if (!newMember.name || !newMember.role) return;
        let photoUrl = newMember.photoUrl;
        if (newMemberPhotoFile) {
            const fd = new FormData();
            fd.append('logo', newMemberPhotoFile);
            const res = await uploadLogoImage(fd);
            photoUrl = res.url || res.cloudinaryUrl || '';
        }
        setTeam([...team, { ...newMember, photoUrl }]);
        setNewMember({ name: '', role: '', photoUrl: '' });
        setNewMemberPhotoFile(null);
    };
    const handleRemoveMember = (i) => setTeam(team.filter((_, idx) => idx !== i));
    const handleAddAchievement = () => {
        if (!newAchievement.title) return;
        setAchievements([...achievements, { ...newAchievement }]);
        setNewAchievement({ title: '', year: '', description: '' });
    };
    const handleRemoveAchievement = (i) => setAchievements(achievements.filter((_, idx) => idx !== i));
    const handleSaveProfile = async () => {
        setProfileSaving(true);
        try {
            await updateUserProfile({ team, achievements });
            setProfileSaved(true);
            setTimeout(() => setProfileSaved(false), 3000);
        } catch (e) {
            setError('Failed to save: ' + e.message);
        } finally {
            setProfileSaving(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        setError('');

        try {
            await updateUserProfile(formData);
            setMessage('Profile updated successfully!');
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            setError('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            await changeUserPassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setMessage('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (err) {
            setError(err.message || 'Failed to change password');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <DashboardLayout user={user} title="Profile">
            <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold font-heading text-slate-900 mb-2">
                    Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Profile</span>
                </h1>
                <p className="text-slate-500 text-lg">Manage your account information{user?.role === 'club-admin' ? ', team, and achievements' : ''}.</p>
            </div>

            <div className="max-w-3xl space-y-8">

                {/* Status Messages */}
                {message && (
                    <div className="p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl font-medium flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" /> {message}
                    </div>
                )}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl font-medium flex items-center gap-2">
                        <XCircle className="w-5 h-5" /> {error}
                    </div>
                )}

                {/* Profile Details Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <User className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold font-heading text-slate-900">Profile Details</h3>
                    </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {user.role === 'club-admin' && (
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">Club Name</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                <input type="text" name="clubName" value={formData.clubName} onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans" />
                            </div>
                        </div>
                    )}
                    {user.role === 'company' && (
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">Organization Name</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                <input type="text" name="organizationName" value={formData.organizationName} onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans" />
                            </div>
                        </div>
                    )}
                    {user.role === 'alumni-individual' && (
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">Former Institution</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                <input type="text" name="formerInstitution" value={formData.formerInstitution} onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans" />
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans"
                                    placeholder="+1 234 567 8900" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">Logo/Avatar URL</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                <input type="text" name="logoUrl" value={formData.logoUrl} onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans"
                                    placeholder="https://example.com/logo.png" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">Description / Bio</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <textarea name="description" value={formData.description} onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans min-h-[100px]"
                                placeholder="Tell us about yourself..." />
                        </div>
                    </div>
                    <button type="submit" disabled={saving}
                        className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-70">
                        {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </form>
            </div>

            {/* Team & Leadership — club-admin only */}
            {user?.role === 'club-admin' && (
                <>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users className="w-5 h-5" /></div>
                                <h3 className="text-lg font-bold text-slate-900">Team &amp; Leadership</h3>
                            </div>
                            <button onClick={handleSaveProfile} disabled={profileSaving}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition text-sm shadow-lg shadow-blue-500/20 disabled:opacity-60">
                                <Save className="w-4 h-4" />{profileSaving ? 'Saving…' : profileSaved ? '✓ Saved!' : 'Save'}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            {team.map((m, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 relative">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 shrink-0 border-2 border-white shadow">
                                        {m.photoUrl ? <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 text-lg font-bold">{m.name[0]}</div>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-900 truncate">{m.name}</p>
                                        <p className="text-sm text-indigo-600 font-medium">{m.role}</p>
                                    </div>
                                    <button onClick={() => handleRemoveMember(i)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 border border-dashed border-slate-300">
                            <p className="text-sm font-bold text-slate-600 mb-3">Add New Member</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                <input className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                    placeholder="Full Name" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} />
                                <input className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                    placeholder="Role (e.g. President)" value={newMember.role} onChange={e => setNewMember({ ...newMember, role: e.target.value })} />
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 font-medium mb-3 w-fit">
                                <Upload className="w-4 h-4" />
                                {newMemberPhotoFile ? newMemberPhotoFile.name : 'Upload Photo (Cloudinary)'}
                                <input type="file" accept="image/*" className="hidden" onChange={e => setNewMemberPhotoFile(e.target.files[0])} />
                            </label>
                            <button onClick={handleAddMember} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition text-sm">
                                <Plus className="w-4 h-4" /> Add Member
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Award className="w-5 h-5" /></div>
                            <h3 className="text-lg font-bold text-slate-900">Club Achievements</h3>
                        </div>
                        <div className="space-y-3 mb-4">
                            {achievements.map((a, i) => (
                                <div key={i} className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100 relative">
                                    <Award className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-900">{a.title}</p>
                                        {a.year && <span className="text-xs font-bold text-amber-600">{a.year}</span>}
                                        {a.description && <p className="text-slate-500 text-sm mt-1">{a.description}</p>}
                                    </div>
                                    <button onClick={() => handleRemoveAchievement(i)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 border border-dashed border-slate-300">
                            <p className="text-sm font-bold text-slate-600 mb-3">Add Achievement</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                <input className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                    placeholder="Achievement Title" value={newAchievement.title} onChange={e => setNewAchievement({ ...newAchievement, title: e.target.value })} />
                                <input className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                    placeholder="Year (e.g. 2024)" value={newAchievement.year} onChange={e => setNewAchievement({ ...newAchievement, year: e.target.value })} />
                            </div>
                            <input className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none mb-3"
                                placeholder="Short description (optional)" value={newAchievement.description} onChange={e => setNewAchievement({ ...newAchievement, description: e.target.value })} />
                            <button onClick={handleAddAchievement} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition text-sm">
                                <Plus className="w-4 h-4" /> Add Achievement
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    </DashboardLayout>
    );
};

export default Profile;
