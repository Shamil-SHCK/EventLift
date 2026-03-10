import { useState, useEffect } from 'react';
import { getClubTransactions, completeTransaction } from '../services/api';
import DashboardLayout from './DashboardLayout';
import { IndianRupee, Clock, CheckCircle2, ChevronDown, ChevronUp, Building2 } from 'lucide-react';

const AdminTransactions = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [clubGroups, setClubGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedClub, setExpandedClub] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await getClubTransactions();
            setClubGroups(data);
        } catch (error) {
            console.error('Failed to fetch admin transactions', error);
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (transactionId) => {
        setProcessingId(transactionId);
        try {
            await completeTransaction(transactionId);
            await fetchData(); // Refresh data to show changes
        } catch {
            alert('Failed to mark transaction as completed');
        } finally {
            setProcessingId(null);
        }
    };

    const toggleClub = (clubId) => {
        if (expandedClub === clubId) setExpandedClub(null);
        else setExpandedClub(clubId);
    };

    return (
        <DashboardLayout user={user} title="Transactions">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-slate-900">
                        Platform <span className="text-indigo-600">Transfers</span>
                    </h1>
                    <p className="text-slate-500 text-lg mt-1 max-w-2xl">
                        Manage sponsorship funds collected by the platform. Mark pending funds as "Completed" once transferred to the club's bank account.
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-blue-50 px-4 py-3 rounded-xl border border-blue-100 flex flex-col items-end">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total Pending</span>
                        <span className="text-xl font-bold text-slate-900 flex items-center">
                            <IndianRupee className="w-4 h-4 mr-0.5 text-blue-500" />
                            {clubGroups.reduce((acc, club) => acc + club.totalPending, 0).toLocaleString()}
                        </span>
                    </div>
                    <div className="bg-green-50 px-4 py-3 rounded-xl border border-green-100 flex flex-col items-end">
                        <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Total Transferred</span>
                        <span className="text-xl font-bold text-slate-900 flex items-center">
                            <IndianRupee className="w-4 h-4 mr-0.5 text-green-500" />
                            {clubGroups.reduce((acc, club) => acc + club.totalCompleted, 0).toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : clubGroups.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center shadow-sm">
                    <IndianRupee className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No Transactions Yet</h3>
                    <p className="text-slate-500">There are no successful sponsorships currently recorded on the platform.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {clubGroups.map(group => (
                        <div key={group.clubId} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all hover:shadow-md">
                            <div 
                                className="p-5 flex items-center justify-between cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors"
                                onClick={() => toggleClub(group.clubId)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">{group.clubName}</h3>
                                        <p className="text-sm text-slate-500">{group.transactions.length} total sponsorships received</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="hidden sm:flex flex-col items-end">
                                        <span className="text-xs font-semibold text-slate-400">Pending Transfer</span>
                                        <span className={`font-bold ${group.totalPending > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                                            ₹{group.totalPending.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="hidden sm:flex flex-col items-end">
                                        <span className="text-xs font-semibold text-slate-400">Transferred</span>
                                        <span className={`font-bold ${group.totalCompleted > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                                            ₹{group.totalCompleted.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                                        {expandedClub === group.clubId ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Expanded Transaction List */}
                            {expandedClub === group.clubId && (
                                <div className="border-t border-slate-200 bg-white p-5">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse min-w-[800px]">
                                            <thead>
                                                <tr className="bg-slate-50">
                                                    <th className="p-3 text-xs font-bold text-slate-500 uppercase rounded-l-lg">Event</th>
                                                    <th className="p-3 text-xs font-bold text-slate-500 uppercase">Sponsor</th>
                                                    <th className="p-3 text-xs font-bold text-slate-500 uppercase">Date</th>
                                                    <th className="p-3 text-xs font-bold text-slate-500 uppercase">Amount</th>
                                                    <th className="p-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                                                    <th className="p-3 text-xs font-bold text-slate-500 uppercase text-right rounded-r-lg">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {group.transactions.map(tx => (
                                                    <tr key={tx._id} className="hover:bg-slate-50/50">
                                                        <td className="p-3 py-4">
                                                            <div className="font-semibold text-slate-900 truncate max-w-[200px]">
                                                                {tx.event?.title || 'Unknown Event'}
                                                            </div>
                                                        </td>
                                                        <td className="p-3 py-4">
                                                            <div className="font-medium text-slate-700">{tx.user?.name || 'Unknown Sponsor'}</div>
                                                            <div className="text-xs text-slate-400">{tx.user?.email}</div>
                                                        </td>
                                                        <td className="p-3 py-4 text-sm text-slate-600">
                                                            {new Date(tx.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="p-3 py-4 font-bold text-slate-900">
                                                            ₹{tx.amount.toLocaleString()}
                                                        </td>
                                                        <td className="p-3 py-4">
                                                            {tx.status === 'pending' ? (
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                                                                    <Clock className="w-3.5 h-3.5" /> Pending Transfer
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Transferred
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-3 py-4 text-right">
                                                            {tx.status === 'pending' ? (
                                                                <button
                                                                    onClick={() => handleComplete(tx._id)}
                                                                    disabled={processingId === tx._id}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                                                                >
                                                                    {processingId === tx._id ? 'Processing...' : 'Mark Transferred'}
                                                                </button>
                                                            ) : (
                                                                <span className="text-sm font-medium text-slate-400 px-3 flex items-center justify-end gap-1">
                                                                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Done
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
};

export default AdminTransactions;
