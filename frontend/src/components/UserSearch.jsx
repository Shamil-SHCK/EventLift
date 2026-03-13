import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers } from '../services/api';
import DashboardLayout from './DashboardLayout';
import { Search, AtSign, User as UserIcon, Loader } from 'lucide-react';

const getRoleLabel = (role) => {
    switch (role) {
        case 'club-admin': return 'Club';
        case 'alumni-individual': return 'Alumni';
        case 'company': return 'Company';
        case 'administrator': return 'Admin';
        default: return role;
    }
};

const getRoleColor = (role) => {
    switch (role) {
        case 'club-admin': return 'bg-blue-50 text-blue-700 border-blue-100';
        case 'alumni-individual': return 'bg-purple-50 text-purple-700 border-purple-100';
        case 'company': return 'bg-green-50 text-green-700 border-green-100';
        case 'administrator': return 'bg-rose-50 text-rose-700 border-rose-100';
        default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
};

const UserSearch = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [searched, setSearched] = useState(false);
    const debounceRef = useRef(null);

    const doSearch = useCallback(async (q) => {
        if (!q.trim()) { setResults([]); setSearched(false); return; }
        setSearching(true);
        try {
            const data = await searchUsers(q);
            setResults(data || []);
            setSearched(true);
        } catch {
            setResults([]);
            setSearched(true);
        } finally {
            setSearching(false);
        }
    }, []);

    const handleChange = (e) => {
        const v = e.target.value;
        setQuery(v);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => doSearch(v), 400);
    };

    const storedUser = (() => {
        try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
    })();

    return (
        <DashboardLayout user={storedUser} title="Search Users">
            <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-bold font-heading text-slate-900 mb-2">
                    Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Users</span>
                </h1>
                <p className="text-slate-500 text-lg">Search by username to discover other members.</p>
            </div>

            {/* Search Bar */}
            <div className="max-w-xl mb-8">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        {searching ? <Loader className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={handleChange}
                        placeholder="Search by username…"
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400 text-base"
                        autoFocus
                    />
                </div>
            </div>

            {/* Results */}
            {searched && results.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center shadow-sm">
                    <Search className="w-14 h-14 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No users found</h3>
                    <p className="text-slate-500 text-sm">Try a different username.</p>
                </div>
            )}

            {results.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {results.map(user => (
                        <button
                            key={user._id}
                            onClick={() => navigate(`/u/${user.username}`)}
                            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-lg hover:border-slate-200 transition-all group text-left"
                        >
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-6 h-6 text-indigo-300" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                    {user.clubName || user.name}
                                </p>
                                <p className="flex items-center gap-1 text-sm text-indigo-600 font-semibold truncate">
                                    <AtSign className="w-3.5 h-3.5 shrink-0" />{user.username}
                                </p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border shrink-0 ${getRoleColor(user.role)}`}>
                                {getRoleLabel(user.role)}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
};

export default UserSearch;
