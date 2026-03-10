import { useState, useEffect } from 'react';
import { getTransactionHistory } from '../services/api';
import DashboardLayout from './DashboardLayout';
import { IndianRupee, Clock, CheckCircle2, XCircle } from 'lucide-react';

const TransactionHistory = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getTransactionHistory();
                setTransactions(data);
            } catch (error) {
                console.error('Failed to fetch transaction history', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success':
                return <CheckCircle2 className="w-5 h-5 text-green-600" />;
            case 'failed':
                return <XCircle className="w-5 h-5 text-red-600" />;
            case 'pending':
            default:
                return <Clock className="w-5 h-5 text-amber-500" />;
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'success':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'failed':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'pending':
            default:
                return 'bg-amber-50 text-amber-700 border-amber-200';
        }
    };

    return (
        <DashboardLayout user={user} title="Transaction History">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-heading text-slate-900">
                    Payment <span className="text-blue-600">History</span>
                </h1>
                <p className="text-slate-500 text-lg">Track your sponsorship transactions and statuses.</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {transactions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="p-5 font-bold text-slate-700 text-sm uppercase tracking-wider">Event Name</th>
                                        <th className="p-5 font-bold text-slate-700 text-sm uppercase tracking-wider">Amount (₹)</th>
                                        <th className="p-5 font-bold text-slate-700 text-sm uppercase tracking-wider">Status</th>
                                        <th className="p-5 font-bold text-slate-700 text-sm uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {transactions.map((tx) => (
                                        <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-5">
                                                <div className="font-semibold text-slate-900">{tx.event?.title || 'Unknown Event'}</div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center font-bold text-slate-900">
                                                    <IndianRupee className="w-4 h-4 mr-1 text-slate-400" />
                                                    {tx.amount.toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-semibold capitalize ${getStatusStyles(tx.status)}`}>
                                                    {getStatusIcon(tx.status)}
                                                    {tx.status}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="text-slate-600 text-sm">
                                                    {new Date(tx.createdAt).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </div>
                                                <div className="text-slate-400 text-xs mt-1">
                                                    {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-slate-500">
                            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 mb-1">No Transactions Found</h3>
                            <p>You haven't made any sponsorship payments yet.</p>
                        </div>
                    )}
                </div>
            )}
        </DashboardLayout>
    );
};

export default TransactionHistory;
