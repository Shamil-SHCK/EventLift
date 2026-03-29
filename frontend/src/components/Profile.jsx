import { useState, useEffect, useRef } from 'react';
import { getCurrentUser, updateUserProfile, changeUserPassword } from '../services/api';
import { uploadLogoImage } from '../services/api/auth';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import {
    User,
    Building2,
    Camera,
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
    Upload,
    CreditCard
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
        occupation: '',
        organizationName: '',
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

    // Logo upload state
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [logoUploading, setLogoUploading] = useState(false);
    const logoInputRef = useRef(null);

    // Club-admin team & achievements state
    const [team, setTeam] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileSaved, setProfileSaved] = useState(false);
    const [newMember, setNewMember] = useState({ name: '', role: '', photoUrl: '' });
    const [newMemberPhotoFile, setNewMemberPhotoFile] = useState(null);
    const [newAchievement, setNewAchievement] = useState({ title: '', year: '', description: '' });

    // Bank details state (club-admin only)
    const [bankDetails, setBankDetails] = useState({
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        upiId: '',
    });
    const [bankSaving, setBankSaving] = useState(false);
    const [bankSaved, setBankSaved] = useState(false);

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
                    occupation: userData.occupation || '',
                    organizationName: userData.organizationName || '',
                });
                if (userData.role === 'club-admin') {
                    setTeam(userData.team || []);
                    setAchievements(userData.achievements || []);
                    setBankDetails(userData.bankDetails || {
                        accountHolderName: '',
                        accountNumber: '',
                        ifscCode: '',
                        bankName: '',
                        upiId: '',
                    });
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

    // Logo file selection handler
    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            setError('Profile icon must be an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('Profile icon must be less than 5MB');
            return;
        }

        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
    };

    // Upload logo to Cloudinary and return the URL
    const uploadLogoToCloudinary = async () => {
        if (!logoFile) return formData.logoUrl;
        setLogoUploading(true);
        try {
            const fd = new FormData();
            fd.append('logo', logoFile);
            const res = await uploadLogoImage(fd);
            const url = res.url || res.cloudinaryUrl || '';
            setFormData(prev => ({ ...prev, logoUrl: url }));
            setLogoFile(null);
            return url;
        } catch (err) {
            throw new Error('Logo upload failed: ' + err.message);
        } finally {
            setLogoUploading(false);
        }
    };

    // Team handlers
    const handleAddMember = async () => {
        if (!newMember.name || !newMember.role) return;
        
        let photoUrl = newMember.photoUrl;
        if (newMemberPhotoFile) {
            if (!newMemberPhotoFile.type.startsWith('image/')) {
                setError('Team photo must be an image file');
                return;
            }
            if (newMemberPhotoFile.size > 2 * 1024 * 1024) {
                setError('Team photo must be less than 2MB');
                return;
            }
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

    const handleSaveBankDetails = async () => {
        setBankSaving(true);
        setError('');
        try {
            await updateUserProfile({ bankDetails });
            setBankSaved(true);
            setTimeout(() => setBankSaved(false), 3000);
        } catch (e) {
            setError('Failed to save bank details: ' + e.message);
        } finally {
            setBankSaving(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        // Validate: description is mandatory for clubs
        if (user?.role === 'club-admin' && !formData.description.trim()) {
            setError('A club description is required. Please describe your club before saving.');
            return;
        }

        setSaving(true);
        try {
            // Upload logo first if a new file was selected
            let finalLogoUrl = formData.logoUrl;
            if (logoFile) {
                finalLogoUrl = await uploadLogoToCloudinary();
            }
            await updateUserProfile({ ...formData, logoUrl: finalLogoUrl });
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
                <p className="text-slate-500 text-lg">Manage your account information{user?.role === 'club-admin' ? ' and achievements' : ''}.</p>
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

                    {/* Profile Icon Upload — clubs and companies only */}
                    {(user.role === 'club-admin' || user.role === 'company') && (
                        <div className="flex flex-col items-center gap-3 pb-6 border-b border-slate-100">
                            <p className="text-sm font-semibold text-slate-700 self-start">Profile Icon</p>
                            <div className="relative group cursor-pointer" onClick={() => logoInputRef.current?.click()}>
                                {/* Avatar circle */}
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-blue-100 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                    {(logoPreview || formData.logoUrl) ? (
                                        <img
                                            src={logoPreview || formData.logoUrl}
                                            alt="Profile icon"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-3xl font-bold text-white select-none">
                                            {(user.name || '?')[0].toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                {/* Hover overlay */}
                                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    {logoUploading ? (
                                        <Loader className="w-6 h-6 text-white animate-spin" />
                                    ) : (
                                        <Camera className="w-6 h-6 text-white" />
                                    )}
                                </div>
                            </div>
                            <p className="text-xs text-slate-400">Click to change · JPG, PNG, WebP · Max 5MB</p>
                            {logoFile && (
                                <p className="text-xs text-blue-600 font-medium">📎 {logoFile.name} — will be uploaded on save</p>
                            )}
                            <input
                                ref={logoInputRef}
                                type="file"
                                accept="image/jpg,image/jpeg,image/png,image/webp,image/avif"
                                className="hidden"
                                onChange={handleLogoChange}
                                id="logo-upload-input"
                            />
                        </div>
                    )}

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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700">Former Institution</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                    <input type="text" name="formerInstitution" value={formData.formerInstitution} onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700">Occupation / Role</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                    <input type="text" name="occupation" value={formData.occupation} onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans"
                                        placeholder="e.g. Software Engineer" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-slate-700">Work Organization</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                    <input type="text" name="organizationName" value={formData.organizationName} onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans"
                                        placeholder="e.g. Google" />
                                </div>
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
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">
                            Description / Bio
                            {user?.role === 'club-admin' && (
                                <span className="text-red-500 ml-1" title="Required for clubs">*</span>
                            )}
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required={user?.role === 'club-admin'}
                                className={`w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans min-h-[100px] ${
                                    user?.role === 'club-admin' && !formData.description.trim()
                                        ? 'border-red-300'
                                        : 'border-slate-200'
                                }`}
                                placeholder={user?.role === 'club-admin' ? 'Describe your club — what it does, its mission, and what you offer...' : 'Tell us about yourself...'}
                            />
                        </div>
                        {user?.role === 'club-admin' && !formData.description.trim() && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <span>⚠</span> Club description is required so sponsors and alumni can learn about you.
                            </p>
                        )}
                    </div>
                    <button type="submit" disabled={saving || logoUploading}
                        className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-70">
                        {(saving || logoUploading) ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {logoUploading ? 'Uploading...' : 'Save Changes'}
                    </button>
                </form>
            </div>


            {/* Bank Account Details — club-admin only */}
            {user?.role === 'club-admin' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><CreditCard className="w-5 h-5" /></div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Bank Account Details</h3>
                            <p className="text-sm text-slate-500">Used by the admin to transfer sponsorship funds to your club.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Account Holder */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-slate-700">Account Holder Name</label>
                            <input
                                type="text"
                                value={bankDetails.accountHolderName}
                                onChange={e => setBankDetails(p => ({ ...p, accountHolderName: e.target.value }))}
                                placeholder="As per bank records"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
                            />
                        </div>

                        {/* Bank Name */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-slate-700">Bank Name</label>
                            <input
                                type="text"
                                value={bankDetails.bankName}
                                onChange={e => setBankDetails(p => ({ ...p, bankName: e.target.value }))}
                                placeholder="e.g. State Bank of India"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
                            />
                        </div>

                        {/* Account Number */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-slate-700">Account Number</label>
                            <input
                                type="text"
                                value={bankDetails.accountNumber}
                                onChange={e => setBankDetails(p => ({ ...p, accountNumber: e.target.value }))}
                                placeholder="Enter account number"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
                            />
                        </div>

                        {/* IFSC */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-slate-700">IFSC Code</label>
                            <input
                                type="text"
                                value={bankDetails.ifscCode}
                                onChange={e => setBankDetails(p => ({ ...p, ifscCode: e.target.value.toUpperCase() }))}
                                placeholder="e.g. SBIN0001234"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
                            />
                        </div>

                        {/* UPI */}
                        <div className="space-y-1.5 sm:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700">UPI ID <span className="text-slate-400 font-normal">(optional)</span></label>
                            <input
                                type="text"
                                value={bankDetails.upiId}
                                onChange={e => setBankDetails(p => ({ ...p, upiId: e.target.value }))}
                                placeholder="yourclub@upi"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
                            />
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-4">
                        <p className="text-xs text-slate-400">
                            🔒 These details are only visible to the platform administrator for processing fund transfers.
                        </p>
                        <div>
                            <button
                                type="button"
                                onClick={handleSaveBankDetails}
                                disabled={bankSaving}
                                className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-70 flex items-center gap-2 w-fit"
                            >
                                {bankSaving ? <Loader className="w-4 h-4 animate-spin" /> : (bankSaved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />)}
                                {bankSaving ? 'Saving...' : (bankSaved ? 'Saved!' : 'Save Bank Details')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Club Achievements — club-admin only */}
            {user?.role === 'club-admin' && (
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
            )}
        </div>
    </DashboardLayout>
    );
};

export default Profile;
