import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changeUserPassword, getCurrentUser } from '../services/api';
import DashboardLayout from './DashboardLayout';
import { Lock, CheckCircle, XCircle } from 'lucide-react';
import { useEffect } from 'react';

const Settings = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        getCurrentUser().then(setUser).catch(() => {});
    }, []);

    const handleSubmit = async (e) => {
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

        setSaving(true);
        try {
            await changeUserPassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            setMessage('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (err) {
            setError(err.message || 'Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout user={user} title="Settings">
            <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold font-heading text-slate-900 mb-2">
                    Account <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Settings</span>
                </h1>
                <p className="text-slate-500 text-lg">Manage your account security and preferences.</p>
            </div>

            <div className="max-w-2xl">
                {/* Security Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                            <Lock className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Security</h2>
                            <p className="text-sm text-slate-500">Update your account password</p>
                        </div>
                    </div>

                    {message && (
                        <div className="mb-5 p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl font-medium flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 shrink-0" /> {message}
                        </div>
                    )}
                    {error && (
                        <div className="mb-5 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl font-medium flex items-center gap-2">
                            <XCircle className="w-5 h-5 shrink-0" /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-slate-700">Current Password</label>
                            <input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-slate-50 transition"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-slate-700">New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-slate-50 transition"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-slate-700">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmNewPassword}
                                    onChange={e => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-slate-50 transition"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors shadow-lg disabled:opacity-60"
                        >
                            <Lock className="w-4 h-4" />
                            {saving ? 'Updating…' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
