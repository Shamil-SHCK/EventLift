import { useState, useEffect } from 'react';
import { getPendingUsers, getAllUsers, verifyUser, resetUserPassword, logoutUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
    Download,
    Eye,
    CheckCircle,
    XCircle,
    RefreshCcw,
    Search,
    Filter,
    FileText,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    X
} from 'lucide-react';

const AdminPanel = ({ isEmbedded = false }) => {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState('pending'); // 'pending' | 'all'
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);

    const handleViewDoc = (docUrl) => {
        setSelectedDoc(`http://localhost:5000/${docUrl}`);
        setZoomLevel(1);
    };

    const closeModal = () => {
        setSelectedDoc(null);
    };

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                let data;
                if (filter === 'pending') {
                    data = await getPendingUsers();
                } else {
                    data = await getAllUsers();
                }
                setUsers(data);
            } catch (err) {
                setError(err.message);
                if (err.message.includes('Not authorized')) {
                    logoutUser();
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [navigate, filter]);

    const handleVerify = async (userId, status) => {
        try {
            await verifyUser(userId, status);
            if (filter === 'pending') {
                setUsers(users.filter((user) => user._id !== userId));
            } else {
                setUsers(users.map(u => u._id === userId ? { ...u, verificationStatus: status } : u));
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleResetPassword = async (userId) => {
        if (!window.confirm('Are you sure you want to reset this user\'s password to "ChangeMe@123"?')) {
            return;
        }
        try {
            await resetUserPassword(userId);
            alert('Password reset successfully');
        } catch (err) {
            alert('Failed to reset password: ' + err.message);
        }
    };

    const handleLogout = () => {
        logoutUser();
        setUsers([]);
        navigate('/');
    };

    if (loading) return (
        <div className="flex items-center justify-center p-12 text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 mr-3"></div>
            Loading data...
        </div>
    );

    return (
        <div className="w-full">
            {/* Document Viewer Modal */}
            {selectedDoc && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={closeModal}>
                    <div className="bg-white rounded-xl overflow-hidden w-full max-w-5xl h-[90vh] flex flex-col relative shadow-2xl animate-fadeIn" onClick={(e) => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Verification Document
                            </h3>
                            <div className="flex items-center gap-2">
                                {!selectedDoc.toLowerCase().endsWith('.pdf') && (
                                    <div className="flex items-center bg-slate-100 rounded-lg p-1 mr-4">
                                        <button onClick={() => setZoomLevel(p => Math.max(0.5, p - 0.25))} className="p-2 hover:bg-white rounded-md transition-colors" title="Zoom Out"><ZoomOut className="w-4 h-4 text-slate-600" /></button>
                                        <span className="w-12 text-center text-xs font-bold text-slate-600">{Math.round(zoomLevel * 100)}%</span>
                                        <button onClick={() => setZoomLevel(p => Math.min(3, p + 0.25))} className="p-2 hover:bg-white rounded-md transition-colors" title="Zoom In"><ZoomIn className="w-4 h-4 text-slate-600" /></button>
                                        <button onClick={() => setZoomLevel(1)} className="p-2 hover:bg-white rounded-md transition-colors ml-1" title="Reset"><RotateCcw className="w-4 h-4 text-slate-600" /></button>
                                    </div>
                                )}
                                <button onClick={closeModal} className="p-2 hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-full transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 bg-slate-100 overflow-hidden flex items-center justify-center relative inner-shadow">
                            {selectedDoc.toLowerCase().endsWith('.pdf') ? (
                                <iframe src={selectedDoc} title="Document" className="w-full h-full border-none" />
                            ) : (
                                <div className="overflow-auto w-full h-full flex items-center justify-center p-8">
                                    <img
                                        src={selectedDoc}
                                        alt="Document"
                                        style={{ transform: `scale(${zoomLevel})` }}
                                        className="transition-transform duration-200 ease-out max-w-full shadow-lg"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Header / Filter Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 p-6 bg-slate-50/50">
                <div className="flex bg-slate-200/50 p-1 rounded-lg">
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${filter === 'pending'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Pending Review
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${filter === 'all'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        All Users
                    </button>
                </div>

                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                </div>
            </div>

            {error && (
                <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Table */}
            {users.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Filter className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">No users found in this category.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User Details</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role & Affiliation</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Verification</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{user.name}</p>
                                                <p className="text-sm text-slate-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
                                                ${user.role === 'club-admin' ? 'bg-green-100 text-green-700' :
                                                    user.role === 'company' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-slate-100 text-slate-700'
                                                }`}>
                                                {user.role}
                                            </span>
                                            <p className="text-sm text-slate-600 max-w-[150px] truncate" title={user.clubName || user.organizationName || user.formerInstitution}>
                                                {user.clubName || user.organizationName || user.formerInstitution || '-'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.verificationDocument ? (
                                            <button
                                                onClick={() => handleViewDoc(user.verificationDocument)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-xs font-semibold"
                                            >
                                                <Eye className="w-3 h-3" /> View Document
                                            </button>
                                        ) : (
                                            <span className="text-slate-400 text-xs italic">No document</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {user.verificationStatus === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleVerify(user._id, 'verified')}
                                                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleVerify(user._id, 'rejected')}
                                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                        title="Reject"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleResetPassword(user._id)}
                                                className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors"
                                                title="Reset Password"
                                            >
                                                <RefreshCcw className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
