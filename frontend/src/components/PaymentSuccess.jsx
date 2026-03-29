import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { confirmSponsorship, confirmGigPayment } from '../services/api';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const sessionId = searchParams.get('session_id');
    const paymentType = searchParams.get('type'); // 'gig' or null/default (event)
    const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
    const [errorMsg, setErrorMsg] = useState('');
    const hasAttempted = useRef(false);

    useEffect(() => {
        const confirmPayment = async () => {
            if (!sessionId) {
                setStatus('error');
                setErrorMsg('Invalid session ID.');
                return;
            }

            if (hasAttempted.current) return;
            hasAttempted.current = true;

            try {
                if (paymentType === 'gig') {
                    await confirmGigPayment(sessionId);
                } else {
                    await confirmSponsorship(sessionId);
                }
                setStatus('success');
            } catch (error) {
                console.error("Confirmation error:", error);
                setStatus('error');
                setErrorMsg(error.msg || error.message || 'Failed to confirm payment.');
            }
        };

        confirmPayment();
    }, [sessionId]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
                {status === 'processing' && (
                    <div className="py-12">
                        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Confirming Payment...</h2>
                        <p className="text-slate-500">Please do not close this page while we process your contribution.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="py-8 animate-fadeIn">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold font-heading text-slate-900 mb-2">Payment Successful!</h2>
                        <p className="text-slate-600 mb-8">
                            {paymentType === 'gig' 
                                ? 'Your escrow payment for the gig work has been received. The platform will hold the funds until the club completes the task.'
                                : 'Thank you for your generous sponsorship. The club will be thrilled to have your support.'}
                        </p>
                        <button
                            onClick={() => {
                                const userStr = localStorage.getItem('user');
                                if (userStr) {
                                    try {
                                        const user = JSON.parse(userStr);
                                        const role = user.role;
                                        if (role === 'company') {
                                            navigate('/company/dashboard');
                                            return;
                                        } else if (role === 'alumni-individual') {
                                            navigate('/alumni/dashboard');
                                            return;
                                        }
                                    } catch (e) {
                                        console.error(e);
                                    }
                                }
                                navigate('/');
                            }}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
                        >
                            Return to Dashboard <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="py-8 animate-fadeIn">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <div className="text-4xl">❌</div>
                        </div>
                        <h2 className="text-2xl font-bold font-heading text-slate-900 mb-2">Payment Confirmation Failed</h2>
                        <p className="text-slate-600 mb-8">{errorMsg}</p>
                        <p className="text-sm text-slate-500 mb-8">If your money was deducted, please contact support.</p>
                        <Link
                            to="/"
                            className="inline-block px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all"
                        >
                            Return Home
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;
