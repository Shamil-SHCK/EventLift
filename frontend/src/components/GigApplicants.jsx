import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { getGigApplicants, manageApplicant } from '../services/api/gigService';
import { getCurrentUser } from '../services/api';
import { Users, CheckCircle, XCircle, ArrowLeft, Mail } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

const GigApplicants = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    // Modal State
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        applicantId: null,
        clubName: '',
        action: 'reject' // 'accept' or 'reject'
    });

    useEffect(() => {
        const init = async () => {
            try {
                const userData = await getCurrentUser();
                if (userData.role !== 'club-admin') {
                    navigate('/login');
                    return;
                }
                setUser(userData);

                // Fetch Gigs
                // Note: This part of the useEffect seems to be for fetching 'gigs' using 'getOpenGigs' and 'filters',
                // which are not directly defined or used in the original GigApplicants component context.
                // Assuming 'getOpenGigs' and 'filters' would be defined elsewhere if this useEffect were fully integrated.
                // For now, I'm keeping the original GigApplicants logic for fetching applicants.
                // If the intention was to replace applicant fetching with gig fetching, this component's purpose would change.
                // For faithful replacement as per instruction, I'm including the provided snippet.
                // However, to make it syntactically correct and functional within GigApplicants,
                // I'll retain the original applicant fetching logic and adapt the error handling.
                // If the user truly meant to replace applicant fetching with gig fetching,
                // then `getGigApplicants` and `setApplicants` would become unused.

                // Original logic for GigApplicants:
                const applicantData = await getGigApplicants(id);
                setApplicants(applicantData);

                // The provided snippet's logic (commented out as it conflicts with GigApplicants' purpose):
                // const data = await getOpenGigs(filters);
                // setGigs(data); // Assuming setGigs is defined

            } catch (err) {
                console.error("Error loading page data", err);
                setError('Failed to load data');
                if (!user) navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [id, navigate, user]); // Added 'id' and 'user' to dependencies for GigApplicants context. Removed 'filters' as it's not defined here.

    const openConfirmation = (applicantId, clubName, action) => {
        setModalConfig({
            isOpen: true,
            applicantId,
            clubName,
            action
        });
    };

    const closeConfirmation = () => {
        if (actionLoading) return; // Prevent closing while processing
        setModalConfig(prev => ({ ...prev, isOpen: false }));
    };

    const confirmAction = async () => {
        const { applicantId, action } = modalConfig;
        setActionLoading(applicantId);

        try {
            await manageApplicant(id, applicantId, action);
            if (action === 'accept') {
                alert('Applicant Accepted! check "Accepted" tab.');
                navigate('/company/dashboard');
            } else {
                setApplicants(applicants.map(app =>
                    app.club._id === applicantId ? { ...app, status: 'rejected' } : app
                ));
                closeConfirmation();
            }
        } catch (error) {
            alert(error.response?.data?.msg || 'Action failed');
            closeConfirmation();
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <DashboardLayout user={user}>
            <div className="mb-8">
                <button onClick={() => navigate('/company/dashboard')} className="flex items-center text-slate-500 hover:text-blue-600 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </button>
                <h1 className="text-3xl font-bold font-heading text-slate-900 mb-2 flex items-center gap-3">
                    <Users className="w-8 h-8 text-blue-600" />
                    Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Applicants</span>
                </h1>
                <p className="text-slate-500 text-lg">Review and select the best club for your gig.</p>
            </div>

            {applicants.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <Users className="w-8 h-8" />
                    </div>
                    <p className="text-slate-500 text-lg font-medium">No applicants yet.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {applicants.map(app => (
                        <div key={app._id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                                    {app.club.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{app.club.name}</h3>
                                    <div className="flex items-center text-slate-500 text-sm gap-4">
                                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {app.club.email}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${app.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {app.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {app.status === 'pending' && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => openConfirmation(app.club._id, app.club.name, 'reject')}
                                        className="px-4 py-2 border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => openConfirmation(app.club._id, app.club.name, 'accept')}
                                        className="px-4 py-2 bg-slate-900 text-white hover:bg-green-600 rounded-lg font-medium shadow-lg hover:shadow-green-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
                                    >
                                        Accept
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={closeConfirmation}
                onConfirm={confirmAction}
                title={modalConfig.action === 'accept' ? 'Accept Application' : 'Reject Application'}
                message={
                    modalConfig.action === 'accept'
                        ? `Are you sure you want to hire ${modalConfig.clubName} for this gig? This will close the gig for other applicants.`
                        : `Are you sure you want to reject the application from ${modalConfig.clubName}? This cannot be undone.`
                }
                confirmText={modalConfig.action === 'accept' ? 'Hire Club' : 'Reject Application'}
                confirmColor={modalConfig.action === 'accept' ? 'green' : 'red'}
                isLoading={!!actionLoading}
            />
        </DashboardLayout>
    );
};

export default GigApplicants;
