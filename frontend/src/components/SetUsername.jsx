import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkUsernameAvailability, setUsername } from '../services/api';
import { AtSign, CheckCircle, XCircle, Loader, ArrowRight } from 'lucide-react';

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

const getDashboardPath = (role) => {
    switch (role) {
        case 'administrator': return '/admin/dashboard';
        case 'company': return '/company/dashboard';
        case 'club-admin': return '/club/dashboard';
        case 'alumni-individual': return '/alumni/dashboard';
        default: return '/';
    }
};

const SetUsername = () => {
    const navigate = useNavigate();
    const [username, setUsernameInput] = useState('');
    const [validationError, setValidationError] = useState('');
    const [availability, setAvailability] = useState(null); // null | 'checking' | true | false
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const debounceRef = useRef(null);

    const validateFormat = (value) => {
        if (!value) return '';
        if (value.length < 3) return 'Must be at least 3 characters';
        if (value.length > 20) return 'Must be at most 20 characters';
        if (!USERNAME_REGEX.test(value)) return 'Only letters, numbers, and underscores allowed';
        return '';
    };

    const checkAvailability = useCallback(async (value) => {
        setAvailability('checking');
        try {
            const res = await checkUsernameAvailability(value);
            setAvailability(res.available);
        } catch {
            setAvailability(null);
        }
    }, []);

    useEffect(() => {
        const formatErr = validateFormat(username);
        setValidationError(formatErr);
        setAvailability(null);

        if (!username || formatErr) return;

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            checkAvailability(username);
        }, 500);

        return () => clearTimeout(debounceRef.current);
    }, [username, checkAvailability]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const formatErr = validateFormat(username);
        if (formatErr) { setValidationError(formatErr); return; }
        if (availability !== true) return;

        setSaving(true);
        try {
            const res = await setUsername(username);
            // Update stored user data with username
            const stored = localStorage.getItem('user');
            if (stored) {
                const parsed = JSON.parse(stored);
                localStorage.setItem('user', JSON.stringify({ ...parsed, username: res.user?.username || username }));
            }
            navigate(getDashboardPath(JSON.parse(localStorage.getItem('user') || '{}').role));
        } catch (err) {
            setError(err.message || 'Failed to set username');
        } finally {
            setSaving(false);
        }
    };

    const isFormValid = !validationError && availability === true && username.length >= 3;

    const renderAvailability = () => {
        if (!username || validationError) return null;
        if (availability === 'checking') {
            return (
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Loader className="w-4 h-4 animate-spin" /> Checking...
                </span>
            );
        }
        if (availability === true) {
            return (
                <span className="flex items-center gap-1.5 text-sm text-green-600 font-semibold">
                    <CheckCircle className="w-4 h-4" /> Available
                </span>
            );
        }
        if (availability === false) {
            return (
                <span className="flex items-center gap-1.5 text-sm text-red-600 font-semibold">
                    <XCircle className="w-4 h-4" /> Already taken
                </span>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10 relative z-10 transition-all hover:shadow-2xl duration-500">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/30">
                        <AtSign className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold font-heading text-slate-900 mb-2">Choose a Username</h2>
                    <p className="text-slate-500">
                        Pick a unique handle for your public profile. You can change it later in Settings.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">Username</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <AtSign className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsernameInput(e.target.value.toLowerCase())}
                                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all text-slate-900 placeholder:text-slate-400 ${
                                    validationError
                                        ? 'border-red-400'
                                        : availability === true
                                        ? 'border-green-400'
                                        : availability === false
                                        ? 'border-red-400'
                                        : 'border-slate-200'
                                }`}
                                placeholder="your_username"
                                maxLength={20}
                                autoFocus
                            />
                        </div>

                        {/* Inline validation / availability */}
                        <div className="min-h-[20px]">
                            {validationError ? (
                                <p className="text-sm text-red-600 font-medium flex items-center gap-1.5">
                                    <XCircle className="w-4 h-4" /> {validationError}
                                </p>
                            ) : (
                                renderAvailability()
                            )}
                        </div>

                        <p className="text-xs text-slate-400 mt-1">
                            3–20 characters · letters, numbers, and underscores only
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={!isFormValid || saving}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        {saving ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" /> Saving...
                            </>
                        ) : (
                            <>
                                Confirm Username <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SetUsername;
