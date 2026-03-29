import { useState, useEffect } from 'react';
import { getCurrentUser, updateUserProfile, uploadLogoImage } from '../services/api';
import DashboardLayout from './DashboardLayout';
import { 
    Users, 
    UserPlus, 
    Trash2, 
    Edit2, 
    Camera, 
    Check, 
    X, 
    ChevronUp, 
    ChevronDown, 
    User,
    Building2,
    Award
} from 'lucide-react';

const ClubTeam = () => {
    const [user, setUser] = useState(null);
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingIndex, setEditingIndex] = useState(-1);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form state for adding/editing
    const [memberForm, setMemberForm] = useState({
        name: '',
        role: 'Core Member',
        photoUrl: ''
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState('');
    const [photoError, setPhotoError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userData = await getCurrentUser();
                setUser(userData);
                setTeam(userData.profile?.team || []);
            } catch (err) {
                setError('Failed to fetch profile: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        setPhotoError('');
        if (file) {
            if (!file.type.startsWith('image/')) {
                setPhotoError('Please select an image file');
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                setPhotoError('Member photo must be less than 2MB');
                return;
            }
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const resetForm = () => {
        setMemberForm({ name: '', role: 'Core Member', photoUrl: '' });
        setPhotoFile(null);
        setPhotoPreview('');
        setEditingIndex(-1);
    };

    const handleAddOrUpdateMember = async (e) => {
        e.preventDefault();
        if (!memberForm.name) {
            setError('Member name is required');
            return;
        }

        setSaving(true);
        setError('');
        try {
            let photoUrl = memberForm.photoUrl;

            // Upload image if selected
            if (photoFile) {
                const fd = new FormData();
                fd.append('logo', photoFile);
                const res = await uploadLogoImage(fd);
                photoUrl = res.url || res.cloudinaryUrl || '';
            }

            let newTeam = [...team];
            if (editingIndex >= 0) {
                newTeam[editingIndex] = { ...memberForm, photoUrl };
            } else {
                newTeam.push({ ...memberForm, photoUrl });
            }

            await updateUserProfile({ team: newTeam });
            setTeam(newTeam);
            setSuccess(editingIndex >= 0 ? 'Member updated successfully!' : 'Member added successfully!');
            resetForm();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to save member: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (index) => {
        const member = team[index];
        setMemberForm({ ...member });
        setEditingIndex(index);
        setPhotoPreview(member.photoUrl);
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (index) => {
        if (!window.confirm('Are you sure you want to remove this member?')) return;
        
        const newTeam = team.filter((_, i) => i !== index);
        setSaving(true);
        try {
            await updateUserProfile({ team: newTeam });
            setTeam(newTeam);
            setSuccess('Member removed successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to remove member: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const moveMember = async (index, direction) => {
        const newTeam = [...team];
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= newTeam.length) return;

        const temp = newTeam[index];
        newTeam[index] = newTeam[targetIndex];
        newTeam[targetIndex] = temp;

        setSaving(true);
        try {
            await updateUserProfile({ team: newTeam });
            setTeam(newTeam);
        } catch (err) {
            setError('Failed to reorder: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Filter team by hierarchy
    const campusLead = team.filter(m => m.role === 'Campus Lead');
    const facultyAdvisor = team.filter(m => m.role === 'Faculty In Charge' || m.role === 'Faculty Advisor');
    const coreMembers = team.filter(m => m.role !== 'Campus Lead' && m.role !== 'Faculty In Charge' && m.role !== 'Faculty Advisor');

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
    );

    return (
        <DashboardLayout user={user} title="Our Team">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 border-l-4 border-blue-600 pl-4">Our Team</h1>
                        <p className="text-slate-500 mt-1 pl-4">Manage your club's core hierarchy and members.</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-bold border border-blue-100">
                        <Users className="w-5 h-5" />
                        {team.length} Members
                    </div>
                </div>

                {/* Add/Edit Form */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-white">
                            <UserPlus className="w-6 h-6 text-blue-400" />
                            <h2 className="text-xl font-bold">{editingIndex >= 0 ? 'Edit Member' : 'Add New Member'}</h2>
                        </div>
                        {editingIndex >= 0 && (
                            <button onClick={resetForm} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    
                    <form onSubmit={handleAddOrUpdateMember} className="p-8">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Photo Upload */}
                            <div className="flex flex-col items-center">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center">
                                        {photoPreview ? (
                                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-12 h-12 text-slate-300" />
                                        )}
                                    </div>
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                                        <Camera className="w-8 h-8 text-white" />
                                        <input type="file" className="hidden" onChange={handlePhotoChange} accept="image/*" />
                                    </label>
                                </div>
                                {photoError && <p className="text-[10px] font-bold text-red-600 mt-2 bg-red-50 px-2 py-1 rounded-md border border-red-100">✕ {photoError}</p>}
                                <p className="text-xs text-slate-400 mt-2">Square photo recommended</p>
                            </div>

                            {/* Inputs */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">Member Name</label>
                                    <input 
                                        type="text" 
                                        value={memberForm.name}
                                        onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans"
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-700">Position / Role</label>
                                    <select 
                                        value={memberForm.role}
                                        onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-sans appearance-none"
                                    >
                                        <option value="Campus Lead">Campus Lead</option>
                                        <option value="Faculty In Charge">Faculty In Charge</option>
                                        <option value="Core Member">Core Member</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                                    <button 
                                        type="button" 
                                        onClick={resetForm}
                                        className="px-6 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold rounded-lg transition-all"
                                    >
                                        Clear
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={saving}
                                        className="px-8 py-2.5 bg-blue-600 text-white hover:bg-blue-700 font-bold rounded-lg transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                                    >
                                        {saving ? 'Saving...' : editingIndex >= 0 ? 'Update Member' : 'Add Member'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {error && <p className="mt-4 text-rose-500 text-sm font-medium bg-rose-50 p-3 rounded-lg border border-rose-100">{error}</p>}
                        {success && <p className="mt-4 text-emerald-500 text-sm font-medium bg-emerald-50 p-3 rounded-lg border border-emerald-100">{success}</p>}
                    </form>
                </div>

                {/* Team Hierarchy Preview */}
                <div className="space-y-10 py-10 border-t border-slate-200">
                    <h2 className="text-2xl font-bold text-center text-slate-800">Hierarchy Preview</h2>
                    
                    {/* Campus Lead */}
                    <div className="flex flex-col items-center">
                        <div className="px-6 py-2 bg-blue-600 text-white text-xs font-bold uppercase tracking-widest rounded-full mb-6">Campus Lead</div>
                        {campusLead.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6">
                                {campusLead.map((m, i) => (
                                    <MemberCard key={i} member={m} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-slate-400 italic text-sm">No Campus Lead added</div>
                        )}
                        <div className="h-10 w-px bg-slate-200 my-4" />
                    </div>

                    {/* Faculty */}
                    <div className="flex flex-col items-center">
                        <div className="px-6 py-2 bg-purple-600 text-white text-xs font-bold uppercase tracking-widest rounded-full mb-6">Faculty In Charge</div>
                        {facultyAdvisor.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {facultyAdvisor.map((m, i) => (
                                    <MemberCard key={i} member={m} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-slate-400 italic text-sm">No Faculty In Charge added</div>
                        )}
                        <div className="h-10 w-px bg-slate-200 my-4" />
                    </div>

                    {/* Core Members */}
                    <div className="flex flex-col items-center">
                        <div className="px-6 py-2 bg-slate-800 text-white text-xs font-bold uppercase tracking-widest rounded-full mb-6">Core Members</div>
                        {coreMembers.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
                                {coreMembers.map((m, i) => (
                                    <MemberCard key={i} member={m} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-slate-400 italic text-sm">No core members added</div>
                        )}
                    </div>
                </div>

                {/* Members List Below */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Users className="w-5 h-5 text-slate-400" />
                            All Members List
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {team.length === 0 ? (
                            <div className="p-10 text-center text-slate-400">
                                No members added yet.
                            </div>
                        ) : (
                            team.map((m, i) => (
                                <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                            {m.photoUrl ? (
                                                <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                    <User className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{m.name}</h4>
                                            <p className="text-xs font-medium text-slate-500 uppercase tracking-tight">{m.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={() => moveMember(i, -1)} 
                                            disabled={i === 0 || saving}
                                            className="p-2 text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-colors"
                                        >
                                            <ChevronUp className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => moveMember(i, 1)} 
                                            disabled={i === team.length - 1 || saving}
                                            className="p-2 text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-colors"
                                        >
                                            <ChevronDown className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => handleEdit(i)}
                                            className="p-2 text-slate-400 hover:text-amber-600 transition-colors ml-2"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(i)}
                                            className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

const MemberCard = ({ member }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex flex-col items-center text-center w-full min-w-[200px] hover:translate-y-[-4px] transition-transform">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 p-1 mb-4">
            <div className="w-full h-full rounded-xl bg-white overflow-hidden flex items-center justify-center">
                {member.photoUrl ? (
                    <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                    <User className="w-10 h-10 text-slate-300" />
                )}
            </div>
        </div>
        <h3 className="font-bold text-slate-900">{member.name}</h3>
        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mt-1">{member.role}</p>
    </div>
);

export default ClubTeam;
