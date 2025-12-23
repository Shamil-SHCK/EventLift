import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyUserOTP } from '../services/api';
import { KeyRound, ArrowRight, Loader, AlertTriangle, ShieldCheck } from 'lucide-react';

const VerifyOTP = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!email) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold font-heading text-slate-900 mb-2">Access Denied</h2>
                    <p className="text-slate-600 mb-6">No email provided for verification. Please complete the registration process first.</p>
                    <button
                        onClick={() => navigate('/register')}
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                    >
                        Go to Register
                    </button>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await verifyUserOTP({ email, otp });

            // Redirect based on role
            const role = response.role;
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
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10 relative z-10 transition-all">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-bold font-heading text-slate-900 mb-2">Verify Email</h2>
                    <p className="text-slate-500">
                        We've sent a secure 6-digit code to <br />
                        <span className="font-semibold text-slate-700">{email}</span>
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2 animate-pulse">
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700 text-center">Enter Verification Code</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                <KeyRound className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all text-slate-900 placeholder:text-slate-300 text-center text-2xl tracking-[0.5em] font-mono font-bold"
                                placeholder="000000"
                                maxLength="6"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" /> Verifying...
                            </>
                        ) : (
                            <>
                                Verify Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button className="text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors">
                        Didn't receive the code? Resend
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;
