import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { cancelSponsorship } from '../services/api';

const PaymentCancel = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const hasCancelled = useRef(false);

    useEffect(() => {
        if (sessionId && !hasCancelled.current) {
            hasCancelled.current = true;
            cancelSponsorship(sessionId).catch(console.error);
        }
    }, [sessionId]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100 animate-fadeIn">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-10 h-10 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold font-heading text-slate-900 mb-2">Payment Cancelled</h2>
                <p className="text-slate-600 mb-8">The checkout process was cancelled and you haven't been charged.</p>
                <button
                    onClick={() => {
                        window.history.back();
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all"
                >
                    <ArrowLeft className="w-5 h-5" /> Return to Previous Page
                </button>
            </div>
        </div>
    );
};

export default PaymentCancel;
