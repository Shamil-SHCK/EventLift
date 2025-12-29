import { useState } from 'react';
import { registerUser } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Building2, GraduationCap, FileText, ArrowRight, Loader, Users, UploadCloud } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'club-admin',
        clubName: '',
        collegeName: '',
        organizationName: '',
        formerInstitution: '',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [verificationFile, setVerificationFile] = useState(null);

    const { name, email, password, confirmPassword, role, clubName, collegeName, organizationName, formerInstitution } = formData;

    const handleChange = (e) => {
        if (e.target.name === 'verificationDocument') {
            setVerificationFile(e.target.files[0]);
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (role === 'club-admin' && !clubName) {
            setError('Club name is required for club registration');
            return;
        }

        if (role === 'club-admin' && !collegeName) {
            setError('College name is required for club registration');
            return;
        }

        if (role === 'company' && !organizationName) {
            setError('Organization name is required for company registration');
            return;
        }

        if (role === 'alumni-individual' && !formerInstitution) {
            setError('Former Institution is required for alumni registration');
            return;
        }

        if ((role === 'club-admin' || role === 'company') && !verificationFile) {
            setError('Verification document is required');
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();
            data.append('name', name);
            data.append('email', email);
            data.append('password', password);
            data.append('role', role);

            if (role === 'club-admin') {
                data.append('clubName', clubName);
                data.append('collegeName', collegeName);
            }

            if (role === 'company') {
                data.append('organizationName', organizationName);
            }

            if (role === 'alumni-individual') {
                data.append('formerInstitution', formerInstitution);
            }

            if (verificationFile) {
                data.append('verificationDocument', verificationFile);
            }

            await registerUser(data);
            setSuccess('OTP sent to your email! Redirecting to verification...');

            // Redirect after successful registration
            setTimeout(() => {
                navigate('/verify-otp', { state: { email: formData.email } });
            }, 1000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-x-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-green-400/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

            <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-10 relative z-10 my-10">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold font-heading text-slate-900 mb-2">Create Account</h2>
                    <p className="text-slate-500">Join EventLift and start your journey</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2 animate-pulse">
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 rounded-xl text-sm font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    value={name}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={password}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">Confirm Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">Account Type</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Users className="w-5 h-5" />
                            </div>
                            <select
                                name="role"
                                value={role}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all text-slate-900 appearance-none cursor-pointer"
                            >
                                <option value="administrator">Administrator</option>
                                <option value="club-admin">Club Admin</option>
                                <option value="alumni-individual">Alumni / Individual Sponsor</option>
                                <option value="company">Company</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {role === 'club-admin' && (
                        <>
                            <div className="space-y-2 animate-fadeIn">
                                <label className="block text-sm font-semibold text-slate-700">Club Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        name="clubName"
                                        value={clubName}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                                        placeholder="e.g. Robotics Club"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 animate-fadeIn">
                                <label className="block text-sm font-semibold text-slate-700">College Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <GraduationCap className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        name="collegeName"
                                        value={collegeName}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                                        placeholder="e.g. IIT Delhi"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {role === 'company' && (
                        <div className="space-y-2 animate-fadeIn">
                            <label className="block text-sm font-semibold text-slate-700">Company Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    name="organizationName"
                                    value={organizationName}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                                    placeholder="e.g. Google"
                                />
                            </div>
                        </div>
                    )}

                    {role === 'alumni-individual' && (
                        <div className="space-y-2 animate-fadeIn">
                            <label className="block text-sm font-semibold text-slate-700">Former Institution</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <GraduationCap className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    name="formerInstitution"
                                    value={formerInstitution}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                                    placeholder="e.g. IIT Delhi"
                                />
                            </div>
                        </div>
                    )}

                    {(role === 'club-admin' || role === 'company') && (
                        <div className="space-y-2 animate-fadeIn">
                            <label className="block text-sm font-semibold text-slate-700">Verification Document</label>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                                        <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> validation doc</p>
                                        <p className="text-xs text-slate-400">PDF, PNG, or JPG (MAX. 5MB)</p>
                                    </div>
                                    <input
                                        type="file"
                                        name="verificationDocument"
                                        className="hidden"
                                        onChange={handleChange}
                                        required
                                        accept=".pdf,.jpg,.jpeg,.png"
                                    />
                                </label>
                            </div>
                            {verificationFile && (
                                <p className="text-sm text-green-600 flex items-center gap-1">
                                    <FileText className="w-4 h-4" /> {verificationFile.name}
                                </p>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" /> Creating Account...
                            </>
                        ) : (
                            <>
                                Register <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
