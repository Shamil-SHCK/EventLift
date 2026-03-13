import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { changeUserPassword, getCurrentUser, checkUsernameAvailability, setUsername } from '../services/api';
import DashboardLayout from './DashboardLayout';
import { Lock, CheckCircle, XCircle, AtSign, Loader } from 'lucide-react';

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

const Settings = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // ── Password State ─────────────────
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // ── Username State ─────────────────
    const [usernameInput, setUsernameInput] = useState('');
    const [usernameValidationError, setUsernameValidationError] = useState('');
    const [usernameAvailability, setUsernameAvailability] = useState(null); // null | 'checking' | true | false
    const [savingUsername, setSavingUsername] = useState(false);
    const [usernameMessage, setUsernameMessage] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const debounceRef = useRef(null);

    useEffect(() => {
        getCurrentUser().then(u => {
            setUser(u);
            setUsernameInput(u?.username || '');
        }).catch(() => {});
    }, []);

    // ── Username validation + debounced check ──
    const validateUsernameFormat = (value) => {
        if (!value) return '';
        if (value.length < 3) return 'Must be at least 3 characters';
        if (value.length > 20) return 'Must be at most 20 characters';
        if (!USERNAME_REGEX.test(value)) return 'Only letters, numbers, and underscores allowed';
        return '';
    };

    const checkAvailability = useCallback(async (value) => {
        setUsernameAvailability('checking');
        try {
            const res = await checkUsernameAvailability(value);
            setUsernameAvailability(res.available);
        } catch {
            setUsernameAvailability(null);
        }
    }, []);

    const handleUsernameChange = (e) => {
        const v = e.target.value.toLowerCase();
        setUsernameInput(v);
        setUsernameMessage('');
        setUsernameError('');
        const formatErr = validateUsernameFormat(v);
        setUsernameValidationError(formatErr);
        setUsernameAvailability(null);

        if (!v || formatErr) return;
        // If same as current username, mark as available without hitting API
        if (v === user?.username) {
            setUsernameAvailability(true);
            return;
        }
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => checkAvailability(v), 500);
    };

    const handleUsernameSave = async (e) => {
        e.preventDefault();
        setUsernameMessage('');
        setUsernameError('');
        const formatErr = validateUsernameFormat(usernameInput);
        if (formatErr) { setUsernameValidationError(formatErr); return; }
        if (usernameAvailability !== true) return;

        setSavingUsername(true);
        try {
            const res = await setUsername(usernameInput);
            const stored = localStorage.getItem('user');
            if (stored) {
                const parsed = JSON.parse(stored);
                localStorage.setItem('user', JSON.stringify({ ...parsed, username: res.user?.username || usernameInput }));
            }
            setUser(prev => ({ ...prev, username: res.user?.username || usernameInput }));
            setUsernameMessage('Username updated successfully!');
        } catch (err) {
            setUsernameError(err.message || 'Failed to update username');
        } finally {
            setSavingUsername(false);
        }
    };

    const renderUsernameAvailability = () => {
        if (!usernameInput || usernameValidationError) return null;
        if (usernameInput === user?.username && usernameAvailability === true) return null; // same as current, don't show
        if (usernameAvailability === 'checking') {
            return <span className="flex items-center gap-1.5 text-sm text-slate-500"><Loader className="w-4 h-4 animate-spin" /> Checking…</span>;
        }
        if (usernameAvailability === true) {
            return <span className="flex items-center gap-1.5 text-sm text-green-600 font-semibold"><CheckCircle className="w-4 h-4" /> Available</span>;
        }
        if (usernameAvailability === false) {
            return <span className="flex items-center gap-1.5 text-sm text-red-600 font-semibold"><XCircle className="w-4 h-4" /> Already taken</span>;
        }
        return null;
    };

    // ── Password submit ────────────────
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

    const isUsernameSaveEnabled = !usernameValidationError && usernameAvailability === true && usernameInput.length >= 3;

    return (
        <DashboardLayout user={user} title="Settings">
            <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold font-heading text-slate-900 mb-2">
                    Account <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Settings</span>
                </h1>
                <p className="text-slate-500 text-lg">Manage your account security and preferences.</p>
            </div>

            <div className="max-w-2xl space-y-6">
                {/* ── Username Card ─────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <AtSign className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Username</h2>
                            <p className="text-sm text-slate-500">Your unique public handle</p>
                        </div>
                    </div>

                    {usernameMessage && (
                        <div className="mb-5 p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl font-medium flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 shrink-0" /> {usernameMessage}
                        </div>
                    )}
                    {usernameError && (
                        <div className="mb-5 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl font-medium flex items-center gap-2">
                            <XCircle className="w-5 h-5 shrink-0" /> {usernameError}
                        </div>
                    )}

                    <form onSubmit={handleUsernameSave} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-slate-700">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <AtSign className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    value={usernameInput}
                                    onChange={handleUsernameChange}
                                    className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none bg-slate-50 transition ${
                                        usernameValidationError
                                            ? 'border-red-400'
                                            : usernameAvailability === true
                                            ? 'border-green-400'
                                            : usernameAvailability === false
                                            ? 'border-red-400'
                                            : 'border-slate-200'
                                    }`}
                                    placeholder="your_username"
                                    maxLength={20}
                                />
                            </div>
                            <div className="min-h-[18px]">
                                {usernameValidationError ? (
                                    <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                                        <XCircle className="w-3.5 h-3.5" /> {usernameValidationError}
                                    </p>
                                ) : (
                                    renderUsernameAvailability()
                                )}
                            </div>
                            <p className="text-xs text-slate-400">3–20 characters · letters, numbers, and underscores only</p>
                        </div>

                        <button
                            type="submit"
                            disabled={!isUsernameSaveEnabled || savingUsername}
                            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-60"
                        >
                            {savingUsername ? (
                                <><Loader className="w-4 h-4 animate-spin" /> Saving…</>
                            ) : (
                                <><AtSign className="w-4 h-4" /> Update Username</>
                            )}
                        </button>
                    </form>
                </div>

                {/* ── Security Card ─────────────────── */}
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
