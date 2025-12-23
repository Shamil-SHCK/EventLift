import { useState, useEffect } from 'react';
import { getCurrentUser, updateUserProfile, changeUserPassword } from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    User,
    Building2,
    Link as LinkIcon,
    Phone,
    FileText,
    Save,
    Lock,
    Loader,
    CheckCircle,
    XCircle
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
    const handleBackToDashboard = () => {
        const role = user.role;
        switch (role) {
            case 'administrator':
                navigate('/admin/dashboard');
                break;
            case 'company':
                navigate('/company/dashboard');
                break;
            case 'club-admin':
                navigate('/club/dashboard');
                break;
            case 'alumni-individual':
                navigate('/alumni/dashboard');
                break;
            default:
                navigate('/');
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
        <div className="min-h-screen bg-slate-50 py-12 px-6">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => handleBackToDashboard()}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-semibold mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" /> Back to Dashboard
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar / Info Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 text-center">
                            <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
                                {user?.name.charAt(0)}
                            </div>
                            <h2 className="text-xl font-bold font-heading text-slate-900">{user?.name}</h2>
                            <p className="text-slate-500 text-sm mb-4">{user?.email}</p>
                            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-full">
                                {user?.role}
                            </span>
                        </div>
                    </div>

                    {/* Main Settings Area */}
                    <div className="lg:col-span-2 space-y-8">

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
                                            <input
                                                type="text"
                                                name="clubName"
                                                value={formData.clubName}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans"
                                            />
                                        </div>
                                    </div>
                                )}

                                {user.role === 'company' && (
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700">Organization Name</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                            <input
                                                type="text"
                                                name="organizationName"
                                                value={formData.organizationName}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans"
                                            />
                                        </div>
                                    </div>
                                )}

                                {user.role === 'alumni-individual' && (
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700">Former Institution</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                            <input
                                                type="text"
                                                name="formerInstitution"
                                                value={formData.formerInstitution}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                            <input
                                                type="text"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans"
                                                placeholder="+1 234 567 8900"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700">Logo/Avatar URL</label>
                                        <div className="relative">
                                            <LinkIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                            <input
                                                type="text"
                                                name="logoUrl"
                                                value={formData.logoUrl}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans"
                                                placeholder="https://example.com/logo.png"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">Description / Bio</label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans min-h-[100px]"
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-70"
                                >
                                    {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Changes
                                </button>
                            </form>
                        </div>

                        {/* Security Form */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold font-heading text-slate-900">Security</h3>
                            </div>

                            <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">Current Password</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700">New Password</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700">Confirm New Password</label>
                                        <input
                                            type="password"
                                            name="confirmNewPassword"
                                            value={passwordData.confirmNewPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-900 transition-colors flex items-center gap-2"
                                >
                                    <Lock className="w-4 h-4" />
                                    Update Password
                                </button>
                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
