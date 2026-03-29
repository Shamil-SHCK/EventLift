import { useState, useEffect, useRef, useMemo } from 'react';
import { getClubTransactions, completeTransaction, uploadTransferProof, getEscrowGigs, payoutGigEscrow } from '../services/api/admin';
import DashboardLayout from './DashboardLayout';
import {
    IndianRupee, Clock, CheckCircle2, ChevronDown, ChevronUp,
    Building2, CreditCard, Upload, ExternalLink, Info, X, ShieldCheck, Phone
} from 'lucide-react';

// ── Bank Details Card ─────────────────────────────────────────────────────────
const BankDetailsCard = ({ bankDetails, phone }) => {
    const hasAny = bankDetails?.accountNumber || bankDetails?.upiId;

    if (!hasAny) {
        return (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-amber-800">Bank details not provided</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                        This club hasn't filled in their bank account info yet. Ask them to update it in their profile.
                    </p>
                    {phone && (
                        <a
                            href={`tel:${phone}`}
                            className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors"
                        >
                            <Phone className="w-3.5 h-3.5" />
                            {phone}
                        </a>
                    )}
                    {!phone && (
                        <p className="text-xs text-amber-500 mt-1 italic">No phone number on file either.</p>
                    )}
                </div>
            </div>
        );
    }

    const Row = ({ label, value }) =>
        value ? (
            <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
                <span className="text-sm font-bold text-slate-800 font-mono">{value}</span>
            </div>
        ) : null;

    return (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-blue-800">Club Bank Account Details</h4>
            </div>
            <div className="bg-white rounded-lg border border-blue-100 px-4 divide-y divide-slate-100">
                <Row label="Account Holder" value={bankDetails.accountHolderName} />
                <Row label="Bank Name"       value={bankDetails.bankName} />
                <Row label="Account No."    value={bankDetails.accountNumber} />
                <Row label="IFSC Code"      value={bankDetails.ifscCode} />
                <Row label="UPI ID"         value={bankDetails.upiId} />
            </div>
        </div>
    );
};

// ── Proof Upload Cell ─────────────────────────────────────────────────────────
const ProofUploadCell = ({ tx, onUploaded }) => {
    const fileInput = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isImage = file.type.startsWith('image/');
        const isPDF = file.type === 'application/pdf';
        if (!isImage && !isPDF) {
            setError('Proof must be an image or PDF');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('Proof must be less than 5MB');
            return;
        }

        setError('');
        setPreview(URL.createObjectURL(file));
        setUploading(true);
        try {
            await uploadTransferProof(tx._id, file);
            onUploaded();
        } catch (err) {
            setError(err.message || 'Upload failed');
            setPreview(null);
        } finally {
            setUploading(false);
        }
    };

    // If already completed and has proof
    if (tx.status === 'completed') {
        return (
            <div className="flex items-center justify-end gap-2">
                {tx.transferProofUrl ? (
                    <a
                        href={tx.transferProofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100 hover:bg-green-100 transition-colors"
                    >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        View Proof
                        <ExternalLink className="w-3 h-3" />
                    </a>
                ) : (
                    <span className="text-sm font-medium text-slate-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" /> Done
                    </span>
                )}
            </div>
        );
    }

    // Pending — show upload button
    return (
        <div className="flex flex-col items-end gap-1">
            <input ref={fileInput} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
            <button
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
                {uploading ? (
                    <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading…</>
                ) : (
                    <><Upload className="w-3.5 h-3.5" /> Upload Proof</>
                )}
            </button>
            {preview && !uploading && (
                <span className="text-xs text-slate-400">Uploading screenshot…</span>
            )}
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
};

// ── Gig Proof Upload Cell ─────────────────────────────────────────────────────────
const GigProofUploadCell = ({ gig, onUploaded }) => {
    const fileInput = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isImage = file.type.startsWith('image/');
        const isPDF = file.type === 'application/pdf';
        if (!isImage && !isPDF) {
            setError('Receipt must be an image or PDF');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('Receipt must be less than 5MB');
            return;
        }

        setError('');
        setPreview(URL.createObjectURL(file));
        setUploading(true);
        try {
            await payoutGigEscrow(gig._id, file);
            onUploaded();
        } catch (err) {
            setError(err.message || 'Upload failed');
            setPreview(null);
        } finally {
            setUploading(false);
        }
    };

    if (gig.status === 'completed') {
        return (
            <div className="flex items-center justify-end gap-2">
                {gig.adminReceipt ? (
                    <a
                        href={gig.adminReceipt}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100 hover:bg-green-100 transition-colors"
                    >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        View Receipt
                        <ExternalLink className="w-3 h-3" />
                    </a>
                ) : (
                    <span className="text-sm font-medium text-slate-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" /> Done
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-end gap-1">
            <input ref={fileInput} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
            <button
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
                {uploading ? (
                    <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading…</>
                ) : (
                    <><Upload className="w-3.5 h-3.5" /> Upload Receipt</>
                )}
            </button>
            {preview && !uploading && (
                <span className="text-xs text-slate-400">Uploading receipt…</span>
            )}
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
};


// ── Main Component ─────────────────────────────────────────────────────────────
const AdminTransactions = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const [clubGroups, setClubGroups] = useState([]);
    const [gigs, setGigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedClub, setExpandedClub] = useState(null);
    const [showBankFor, setShowBankFor] = useState(null); // clubId of the bank panel shown
    const [activeTab, setActiveTab] = useState('events');

    const gigClubGroups = useMemo(() => {
        const grouped = {};
        gigs.forEach(gig => {
            if (!gig.assignedClub) return;
            // assignedClub is populated with ClubProfile details including _id, clubName, etc.
            const clubId = gig.assignedClub._id;
            if (!grouped[clubId]) {
                grouped[clubId] = {
                    clubId,
                    clubName: gig.assignedClub.clubName || 'Unknown Club',
                    collegeName: gig.assignedClub.collegeName || '',
                    phone: gig.assignedClub.phone || '',
                    bankDetails: gig.assignedClub.bankDetails || {},
                    totalPending: 0,
                    totalCompleted: 0,
                    gigs: []
                };
            }
            grouped[clubId].gigs.push(gig);
            const amount = gig.winningBid || gig.budget || 0;
            if (gig.status === 'paid_to_platform') {
                grouped[clubId].totalPending += amount;
            } else if (gig.status === 'completed') {
                grouped[clubId].totalCompleted += amount;
            }
        });
        return Object.values(grouped);
    }, [gigs]);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [data, gigsData] = await Promise.all([
                getClubTransactions(),
                getEscrowGigs()
            ]);
            setClubGroups(data);
            setGigs(gigsData);
        } catch (error) {
            console.error('Failed to fetch admin transactions', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleClub = (clubId) => {
        setExpandedClub(prev => prev === clubId ? null : clubId);
        setShowBankFor(null);
    };

    const eventPending   = clubGroups.reduce((acc, c) => acc + c.totalPending, 0);
    const eventCompleted = clubGroups.reduce((acc, c) => acc + c.totalCompleted, 0);
    const gigPending     = gigs.filter(g => g.status === 'paid_to_platform').reduce((acc, g) => acc + (g.winningBid || g.budget || 0), 0);
    const gigCompleted   = gigs.filter(g => g.status === 'completed').reduce((acc, g) => acc + (g.winningBid || g.budget || 0), 0);

    const totalToTransfer = eventPending + gigPending;
    const totalTransferred = eventCompleted + gigCompleted;

    return (
        <DashboardLayout user={user} title="Transactions">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-slate-900">
                        Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Transfers</span>
                    </h1>
                    <p className="text-slate-500 text-lg mt-1 max-w-2xl">
                        View club bank details and upload transfer proofs for events and gig payouts.
                    </p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <div className="bg-amber-50 px-4 py-3 rounded-xl border border-amber-100 flex flex-col items-end">
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Total Pending Transfers</span>
                        <span className="text-xl font-bold text-slate-900 flex items-center">
                            <IndianRupee className="w-4 h-4 mr-0.5 text-amber-500" />
                            {totalToTransfer.toLocaleString()}
                        </span>
                        <div className="flex gap-2 mt-1 text-[9px] font-bold uppercase text-slate-400">
                            <span>Events: ₹{eventPending.toLocaleString()}</span>
                            <span>•</span>
                            <span>Gigs: ₹{gigPending.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="bg-green-50 px-4 py-3 rounded-xl border border-green-100 flex flex-col items-end">
                        <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Total Completed Transfers</span>
                        <span className="text-xl font-bold text-slate-900 flex items-center">
                            <IndianRupee className="w-4 h-4 mr-0.5 text-green-500" />
                            {totalTransferred.toLocaleString()}
                        </span>
                        <div className="flex gap-2 mt-1 text-[9px] font-bold uppercase text-slate-400">
                            <span>Events: ₹{eventCompleted.toLocaleString()}</span>
                            <span>•</span>
                            <span>Gigs: ₹{gigCompleted.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Toggle */}
            <div className="flex mb-8">
                <div className="bg-slate-100 p-1 rounded-xl inline-flex shadow-inner">
                    <button
                        onClick={() => setActiveTab('events')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'events'
                            ? 'bg-white text-blue-800 shadow-sm border border-slate-200'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                            }`}
                    >
                        Event Sponsorships
                    </button>
                    <button
                        onClick={() => setActiveTab('gigs')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === 'gigs'
                            ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                            }`}
                    >
                        Gig Payouts
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
            ) : activeTab === 'events' ? (
                clubGroups.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center shadow-sm">
                        <IndianRupee className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Transactions Yet</h3>
                        <p className="text-slate-500">There are no successful sponsorships currently recorded on the platform.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {clubGroups.map(group => (
                        <div key={group.clubId} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all hover:shadow-md">

                            {/* Club header row */}
                            <div
                                className="p-5 flex items-center justify-between cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors"
                                onClick={() => toggleClub(group.clubId)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">{group.clubName}</h3>
                                        <p className="text-sm text-slate-500">
                                            {group.collegeName && <span className="mr-2">{group.collegeName} ·</span>}
                                            {group.transactions.length} sponsorship{group.transactions.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="hidden sm:flex flex-col items-end">
                                        <span className="text-xs font-semibold text-slate-400">Pending</span>
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
                                    {/* Bank details toggle button */}
                                    <button
                                        onClick={e => {
                                            e.stopPropagation();
                                            setShowBankFor(prev => prev === group.clubId ? null : group.clubId);
                                            setExpandedClub(group.clubId);
                                        }}
                                        title="View bank account details"
                                        className={`p-2 rounded-lg border transition-colors ${
                                            showBankFor === group.clubId
                                                ? 'bg-blue-600 border-blue-600 text-white'
                                                : 'bg-white border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-600'
                                        }`}
                                    >
                                        <CreditCard className="w-4 h-4" />
                                    </button>
                                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                                        {expandedClub === group.clubId ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                </div>
                            </div>

                            {/* Expanded content */}
                            {expandedClub === group.clubId && (
                                <div className="border-t border-slate-200 bg-white p-5 space-y-5">

                                    {/* Bank details panel (conditionally shown) */}
                                    {showBankFor === group.clubId && (
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowBankFor(null)}
                                                className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition z-10"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <BankDetailsCard bankDetails={group.bankDetails} phone={group.phone} />
                                        </div>
                                    )}

                                    {/* Transactions table */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse min-w-[820px]">
                                            <thead>
                                                <tr className="bg-slate-50">
                                                    <th className="p-3 text-xs font-bold text-slate-500 uppercase rounded-l-lg">Event</th>
                                                    <th className="p-3 text-xs font-bold text-slate-500 uppercase">Sponsor (Company)</th>
                                                    <th className="p-3 text-xs font-bold text-slate-500 uppercase">Date</th>
                                                    <th className="p-3 text-xs font-bold text-slate-500 uppercase">Amount</th>
                                                    <th className="p-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                                                    <th className="p-3 text-xs font-bold text-slate-500 uppercase text-right rounded-r-lg">Transfer Proof</th>
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
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                                                                    <Clock className="w-3.5 h-3.5" /> Pending Transfer
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Transferred
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-3 py-4 text-right">
                                                            <ProofUploadCell tx={tx} onUploaded={fetchData} />
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
                )
            ) : (
                gigs.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center shadow-sm">
                        <Building2 className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Gigs Yet</h3>
                        <p className="text-slate-500">There are no gigs in the payout stage currently.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {gigClubGroups.map(group => (
                            <div key={group.clubId} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all hover:shadow-md">
                                {/* Club header row */}
                                <div
                                    className="p-5 flex items-center justify-between cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors"
                                    onClick={() => toggleClub(`gig-${group.clubId}`)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">{group.clubName}</h3>
                                            <p className="text-sm text-slate-500">
                                                {group.collegeName && <span className="mr-2">{group.collegeName} ·</span>}
                                                {group.gigs.length} gig{group.gigs.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="hidden sm:flex flex-col items-end">
                                            <span className="text-xs font-semibold text-slate-400">Pending</span>
                                            <span className={`font-bold ${group.totalPending > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                                                ₹{group.totalPending.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="hidden sm:flex flex-col items-end">
                                            <span className="text-xs font-semibold text-slate-400">Transferred</span>
                                            <span className={`font-bold ${group.totalCompleted > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                                                ₹{group.totalCompleted.toLocaleString()}
                                            </span>
                                        </div>
                                        {/* Bank details toggle button */}
                                        <button
                                            onClick={e => {
                                                e.stopPropagation();
                                                setShowBankFor(prev => prev === `gig-${group.clubId}` ? null : `gig-${group.clubId}`);
                                                setExpandedClub(`gig-${group.clubId}`);
                                            }}
                                            title="View bank account details"
                                            className={`p-2 rounded-lg border transition-colors ${
                                                showBankFor === `gig-${group.clubId}`
                                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                                    : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-400 hover:text-indigo-600'
                                            }`}
                                        >
                                            <CreditCard className="w-4 h-4" />
                                        </button>
                                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                                            {expandedClub === `gig-${group.clubId}` ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded content */}
                                {expandedClub === `gig-${group.clubId}` && (
                                    <div className="border-t border-slate-200 bg-white p-5 space-y-5">
                                        {/* Bank details panel */}
                                        {showBankFor === `gig-${group.clubId}` && (
                                            <div className="relative">
                                                <button
                                                    onClick={() => setShowBankFor(null)}
                                                    className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition z-10"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                                <BankDetailsCard bankDetails={group.bankDetails} phone={group.phone} />
                                            </div>
                                        )}

                                        {/* Gigs table */}
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse min-w-[820px]">
                                                <thead>
                                                    <tr className="bg-slate-50">
                                                        <th className="p-3 text-xs font-bold text-slate-500 uppercase rounded-l-lg">Gig Work</th>
                                                        <th className="p-3 text-xs font-bold text-slate-500 uppercase">Company (Client)</th>
                                                        <th className="p-3 text-xs font-bold text-slate-500 uppercase">Category</th>
                                                        <th className="p-3 text-xs font-bold text-slate-500 uppercase">Amount</th>
                                                        <th className="p-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                                                        <th className="p-3 text-xs font-bold text-slate-500 uppercase text-right rounded-r-lg">Transfer Proof</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {group.gigs.map(gig => (
                                                        <tr key={gig._id} className="hover:bg-slate-50/50">
                                                            <td className="p-3 py-4">
                                                                <div className="font-bold text-slate-900">{gig.title}</div>
                                                            </td>
                                                            <td className="p-3 py-4">
                                                                <div className="font-medium text-slate-700">{gig.company?.organizationName || gig.company?.name || 'Unknown Client'}</div>
                                                                <div className="text-xs text-slate-400">{gig.company?.email}</div>
                                                            </td>
                                                            <td className="p-3 py-4">
                                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase">
                                                                    {gig.category}
                                                                </span>
                                                            </td>
                                                            <td className="p-3 py-4 font-bold text-slate-900">
                                                                ₹{(gig.winningBid || gig.budget || 0).toLocaleString()}
                                                            </td>
                                                            <td className="p-3 py-4">
                                                                {gig.status === 'paid_to_platform' ? (
                                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                                                                        <Clock className="w-3.5 h-3.5" /> Pending Transfer
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Transferred
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="p-3 py-4 text-right">
                                                                <GigProofUploadCell gig={gig} onUploaded={fetchData} />
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
                )
            )}
        </DashboardLayout>
    );
};

export default AdminTransactions;
