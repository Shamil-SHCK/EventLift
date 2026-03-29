import { useState, useEffect } from 'react';
import { fetchClubsDirectory, getCurrentUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import {
    Users, Building2, MapPin, ExternalLink,
    Trophy, Star, TrendingUp, Calendar, Award,
} from 'lucide-react';

// ── Tier config ─────────────────────────────────────────────────────
const TIERS = {
    Platinum: {
        cardBg:     'bg-gradient-to-br from-slate-900 to-indigo-950',
        headerBar:  'bg-gradient-to-r from-violet-500 via-cyan-400 to-indigo-500',
        badge:      'bg-gradient-to-r from-violet-500 to-cyan-400 text-white shadow-violet-300/50',
        badgeShadow:'shadow-lg shadow-violet-300/30',
        ring:       'ring-2 ring-violet-400/60',
        scoreBar:   'bg-gradient-to-r from-violet-500 to-cyan-400',
        scoreBg:    'bg-white/10',
        rankText:   'text-cyan-300',
        nameText:   'text-white',
        subText:    'text-slate-300',
        descText:   'text-slate-400',
        chipBg:     'bg-white/10 border-white/10 text-white',
        chipIcon:   'opacity-90',
        btn:        'bg-gradient-to-r from-violet-500 to-cyan-400 text-white hover:opacity-90 shadow-md shadow-violet-500/30',
        emoji:      '💎',
    },
    Gold: {
        cardBg:     'bg-gradient-to-br from-amber-950 to-yellow-900',
        headerBar:  'bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400',
        badge:      'bg-gradient-to-r from-yellow-400 to-orange-400 text-amber-900 shadow-yellow-300/50',
        badgeShadow:'shadow-lg shadow-yellow-400/30',
        ring:       'ring-2 ring-yellow-400/60',
        scoreBar:   'bg-gradient-to-r from-yellow-400 to-orange-400',
        scoreBg:    'bg-white/10',
        rankText:   'text-yellow-300',
        nameText:   'text-white',
        subText:    'text-amber-200',
        descText:   'text-amber-300/80',
        chipBg:     'bg-white/10 border-white/10 text-white',
        chipIcon:   'opacity-90',
        btn:        'bg-gradient-to-r from-yellow-400 to-orange-400 text-amber-900 font-bold hover:opacity-90 shadow-md shadow-yellow-400/30',
        emoji:      '🥇',
    },
    Silver: {
        cardBg:     'bg-white',
        headerBar:  'bg-gradient-to-r from-slate-400 to-slate-500',
        badge:      'bg-gradient-to-r from-slate-500 to-slate-600 text-white',
        badgeShadow:'shadow-sm',
        ring:       'ring-1 ring-slate-300',
        scoreBar:   'bg-gradient-to-r from-slate-400 to-slate-600',
        scoreBg:    'bg-slate-100',
        rankText:   'text-slate-400',
        nameText:   'text-slate-900',
        subText:    'text-slate-500',
        descText:   'text-slate-500',
        chipBg:     'bg-slate-50 border-slate-200 text-slate-700',
        chipIcon:   '',
        btn:        'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200',
        emoji:      '🥈',
    },
    Bronze: {
        cardBg:     'bg-white',
        headerBar:  'bg-gradient-to-r from-amber-600 to-amber-700',
        badge:      'bg-gradient-to-r from-amber-600 to-amber-700 text-white',
        badgeShadow:'shadow-sm',
        ring:       'ring-1 ring-amber-200',
        scoreBar:   'bg-gradient-to-r from-amber-500 to-amber-600',
        scoreBg:    'bg-amber-50',
        rankText:   'text-amber-500',
        nameText:   'text-slate-900',
        subText:    'text-slate-500',
        descText:   'text-slate-500',
        chipBg:     'bg-slate-50 border-slate-200 text-slate-700',
        chipIcon:   '',
        btn:        'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200',
        emoji:      '🥉',
    },
};

const PODIUM_LABELS = ['#1', '#2', '#3'];

const formatCurrency = (n) => {
    if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
    if (n >= 1_000)   return `₹${(n / 1_000).toFixed(1)}K`;
    return `₹${n}`;
};

// ── Stat chip ───────────────────────────────────────────────────────
const StatChip = ({ icon: Icon, value, label, chipClass, iconColor }) => (
    <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 border text-xs font-semibold ${chipClass}`}>
        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        <span className="font-bold">{value}</span>
        <span className="opacity-70">{label}</span>
    </div>
);

// ── Club card ───────────────────────────────────────────────────────
const ClubCard = ({ club, onView }) => {
    const tier  = TIERS[club.tier] || TIERS.Bronze;
    const isDark = club.tier === 'Platinum' || club.tier === 'Gold';
    const isTop3 = club.rank <= 3;

    return (
        <div className={`relative rounded-2xl overflow-hidden flex flex-col transition-all duration-300
            hover:-translate-y-1.5 hover:shadow-2xl
            ${tier.cardBg} ${isTop3 ? tier.ring : 'shadow-sm border border-slate-100'} shadow-md`}
        >
            {/* Coloured header stripe */}
            <div className={`h-1 w-full ${tier.headerBar}`} />

            <div className="p-5 flex-1 flex flex-col gap-3">

                {/* Row 1: rank + badge */}
                <div className="flex items-center justify-between">
                    <span className={`text-3xl font-black leading-none ${tier.rankText}`}>
                        {isTop3
                            ? <span className="text-2xl">{['🥇','🥈','🥉'][club.rank - 1]}</span>
                            : <span className="text-xl">#{club.rank}</span>}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${tier.badge} ${tier.badgeShadow}`}>
                        {tier.emoji} {club.tier}
                    </span>
                </div>

                {/* Row 2: logo + name */}
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center
                        ${isDark ? 'bg-white/15 border border-white/20' : 'bg-slate-100 border border-slate-200'}`}>
                        {club.logoUrl
                            ? <img src={club.logoUrl} alt={club.clubName} className="w-full h-full object-cover" />
                            : <Building2 className={`w-6 h-6 ${isDark ? 'text-white/60' : 'text-slate-400'}`} />
                        }
                    </div>
                    <div className="min-w-0">
                        <h3 className={`font-bold text-base leading-tight line-clamp-1 ${tier.nameText}`}>
                            {club.clubName}
                        </h3>
                        <div className={`flex items-center gap-1 text-xs mt-0.5 ${tier.subText}`}>
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="line-clamp-1">{club.collegeName}</span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p className={`text-xs leading-relaxed line-clamp-2 ${tier.descText}`}>
                    {club.description || 'No description provided.'}
                </p>

                {/* Score bar */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-semibold ${isDark ? 'text-white/60' : 'text-slate-400'}`}>
                            Ranking Score
                        </span>
                        <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            {club.score}
                            <span className={`text-xs font-normal ml-0.5 ${isDark ? 'text-white/50' : 'text-slate-400'}`}>/100</span>
                        </span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${tier.scoreBg}`}>
                        <div
                            className={`h-full rounded-full ${tier.scoreBar}`}
                            style={{ width: `${club.score}%` }}
                        />
                    </div>
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap gap-1.5">
                    <StatChip
                        icon={TrendingUp}
                        value={formatCurrency(club.stats?.totalRaised || 0)}
                        label="raised"
                        chipClass={tier.chipBg}
                        iconColor={isDark ? 'text-emerald-300' : 'text-emerald-500'}
                    />
                    <StatChip
                        icon={Calendar}
                        value={club.stats?.eventCount || 0}
                        label="events"
                        chipClass={tier.chipBg}
                        iconColor={isDark ? 'text-sky-300' : 'text-blue-500'}
                    />
                    <StatChip
                        icon={Star}
                        value={club.stats?.consistentMonths || 0}
                        label="months"
                        chipClass={tier.chipBg}
                        iconColor={isDark ? 'text-violet-300' : 'text-violet-500'}
                    />
                    {(club.stats?.achievementCount > 0) && (
                        <StatChip
                            icon={Award}
                            value={club.stats.achievementCount}
                            label="awards"
                            chipClass={tier.chipBg}
                            iconColor={isDark ? 'text-amber-300' : 'text-amber-500'}
                        />
                    )}
                </div>

                {/* CTA button */}
                <button
                    onClick={() => onView(club._id)}
                    className={`w-full py-2.5 mt-auto rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${tier.btn}`}
                >
                    View Profile <ExternalLink className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
};


// ── Main component ──────────────────────────────────────────────────
const ClubDirectory = ({ hideLayout = false }) => {
    const [clubs, setClubs]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser]       = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const initData = async () => {
            try {
                const [data, currentUser] = await Promise.all([
                    fetchClubsDirectory(),
                    getCurrentUser().catch(() => null),
                ]);

                let filtered = data;
                if (currentUser && (currentUser.role === 'alumni' || currentUser.role === 'alumni-individual')) {
                    const formerInstitution = currentUser.profile?.formerInstitution || currentUser.formerInstitution;
                    if (formerInstitution) {
                        filtered = data.filter(c =>
                            c.collegeName?.toLowerCase() === formerInstitution.toLowerCase()
                        );
                    }
                }
                setClubs(filtered);
                setUser(currentUser);
            } catch (err) {
                console.error('Failed to fetch clubs directory', err);
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, []);


    const totalRaised = clubs.reduce((s, c) => s + (c.stats?.totalRaised || 0), 0);
    const totalEvents = clubs.reduce((s, c) => s + (c.stats?.eventCount  || 0), 0);

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
    );

    const content = (
        <div>
            {/* ── Page header ── */}
            <div className="mb-7">
                <div className="flex items-center gap-3 mb-1">
                    <Trophy className="w-8 h-8 text-indigo-500" />
                    <h1 className="text-3xl lg:text-4xl font-black text-slate-900">
                        Club <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                            Rankings
                        </span>
                    </h1>
                </div>
                <p className="text-slate-500 ml-11">Ranked by sponsorship raised, events, and consistency.</p>
            </div>

            {/* ── Summary banner ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                    { icon: Users,     label: 'Active Clubs',  value: clubs.length,               grad: 'from-indigo-500 to-violet-500' },
                    { icon: TrendingUp,label: 'Total Raised',  value: formatCurrency(totalRaised), grad: 'from-emerald-500 to-teal-500'  },
                    { icon: Calendar,  label: 'Events Hosted', value: totalEvents,                 grad: 'from-sky-500 to-blue-500'      },
                ].map(({ icon: Icon, label, value, grad }) => (
                    <div key={label}
                        className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${grad} shadow-md`}>
                            <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-medium">{label}</p>
                            <p className="text-2xl font-black text-slate-800">{value}</p>
                        </div>
                        {/* decorative blob */}
                        <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full bg-gradient-to-br ${grad} opacity-10`} />
                    </div>
                ))}
            </div>


            {/* ── Club grid ── */}
            {clubs.length === 0 ? (
                <div className="bg-white p-14 rounded-2xl border border-slate-100 text-center shadow-sm">
                    <Trophy className="w-14 h-14 mx-auto text-slate-200 mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-1">No clubs yet</h3>
                    <p className="text-slate-400 text-sm">No clubs have been registered yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {clubs.map(club => (
                        <ClubCard
                            key={club._id}
                            club={club}
                            onView={id => navigate(`/clubs/${id}`)}
                        />
                    ))}
                </div>
            )}
        </div>
    );

    if (hideLayout) return content;

    return (
        <DashboardLayout user={user} title="Club Rankings">
            {content}
        </DashboardLayout>
    );
};

export default ClubDirectory;
