import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { request } from '../services/api/core';
import DashboardLayout from './DashboardLayout';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Camera, Plus, IndianRupee, Award, Lock, FileText, CheckCircle } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ImpactDashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const [loading, setLoading] = useState(true);
    const [impactData, setImpactData] = useState(null);
    const [error, setError] = useState('');

    // Form States
    const [expenseForm, setExpenseForm] = useState({ category: 'Venue', amount: '', description: '' });
    const [expenseSubmitting, setExpenseSubmitting] = useState(false);

    const [imageFile, setImageFile] = useState(null);
    const [imageCaption, setImageCaption] = useState('');
    const [imageUploading, setImageUploading] = useState(false);

    useEffect(() => {
        fetchImpactData();
    }, [id]);

    const fetchImpactData = async () => {
        try {
            setLoading(true);
            const data = await request(`/events/${id}/impact`, { method: 'GET' });
            setImpactData(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load impact report');
        } finally {
            setLoading(false);
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        setExpenseSubmitting(true);
        try {
            await request(`/events/${id}/impact/expense`, {
                method: 'POST',
                body: expenseForm
            });
            setExpenseForm({ category: 'Venue', amount: '', description: '' });
            fetchImpactData(); // Refresh
        } catch (err) {
            alert('Failed to add expense');
        } finally {
            setExpenseSubmitting(false);
        }
    };

    const handleImageUpload = async (e) => {
        e.preventDefault();
        if (!imageFile) return;
        
        setError('');
        if (!imageFile.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }
        if (imageFile.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB');
            return;
        }

        setImageUploading(true);
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('caption', imageCaption);

        try {
            // Need custom request for FormData or use fetch directly
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/events/${id}/impact/image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) throw new Error('Upload failed');

            setImageFile(null);
            setImageCaption('');
            fetchImpactData();
        } catch (err) {
            setError('Failed to upload image. Please try again.');
        } finally {
            setImageUploading(false);
        }
    };

    if (loading) return (
        <DashboardLayout user={user}>
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        </DashboardLayout>
    );

    if (error) return (
        <DashboardLayout user={user}>
            <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl border border-red-100">
                {error}
            </div>
        </DashboardLayout>
    );

    if (impactData?.status === 'ongoing') {
        return (
            <DashboardLayout user={user} title="Impact Report">
                <div className="max-w-4xl mx-auto py-12 text-center">
                    <div className="w-24 h-24 bg-indigo-50 text-indigo-300 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-12 h-12" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">Post-Event Transparency Report</h1>
                    <p className="text-xl text-slate-500 mb-8 max-w-2xl mx-auto">
                        This event is currently ongoing. The impact report, including fund utilization and success gallery, will be generated and available here after the event concludes on <strong>{new Date(impactData.event.date).toLocaleDateString()}</strong>.
                    </p>
                    <div className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">
                        <CheckCircle className="w-4 h-4 mr-2" /> Verified Transparent Platform
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const isClubAdmin = user?.role === 'club-admin';

    // Prepare chart data
    const expenses = impactData?.expenses || [];
    const chartData = expenses.reduce((acc, exp) => {
        const existing = acc.find(item => item.name === exp.category);
        if (existing) {
            existing.value += exp.amount;
        } else {
            acc.push({ name: exp.category, value: exp.amount });
        }
        return acc;
    }, []);

    // If no expenses, show placeholder
    const showChart = chartData.length > 0;

    return (
        <DashboardLayout user={user} title="Impact Report">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider mb-4 border border-green-200">
                        <Award className="w-4 h-4 mr-1" /> Impact Verified
                    </div>
                    <h1 className="text-4xl font-bold font-heading text-slate-900 mb-2">{impactData.event.title}</h1>
                    <p className="text-slate-500 text-lg">Transparency & Impact Report</p>
                </div>

                {/* Financial Transparency Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                        <h2 className="text-xl font-bold font-heading text-slate-900 mb-6 flex items-center">
                            <IndianRupee className="w-5 h-5 mr-2 text-indigo-600" />
                            Fund Utilization Breakdown
                        </h2>

                        {showChart ? (
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 p-8">
                                <FileText className="w-12 h-12 mb-2 opacity-50" />
                                <p>No expense data reported yet.</p>
                            </div>
                        )}

                        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p className="text-xs text-slate-400 uppercase font-bold">Total Raised</p>
                                <p className="text-2xl font-bold text-green-600">₹{impactData.event.raised?.toLocaleString() || 0}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 uppercase font-bold">Total Spent</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    ₹{expenses.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Expense Entry Form (Only for Club Admin) */}
                    {isClubAdmin && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h2 className="text-xl font-bold font-heading text-slate-900 mb-6 flex items-center">
                                <Plus className="w-5 h-5 mr-2 text-indigo-600" />
                                Add Expense Record
                            </h2>
                            <form onSubmit={handleAddExpense} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                    <input
                                        list="expense-categories"
                                        value={expenseForm.category}
                                        onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all text-sm"
                                        placeholder="Select or type..."
                                    />
                                    <datalist id="expense-categories">
                                        {['Venue', 'Catering', 'Logistics', 'Marketing', 'Prizes', 'Miscellaneous'].map(c => (
                                            <option key={c} value={c} />
                                        ))}
                                    </datalist>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        value={expenseForm.amount}
                                        onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                    <input
                                        type="text"
                                        placeholder="Specific details..."
                                        value={expenseForm.description}
                                        onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all text-sm"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={expenseSubmitting}
                                    className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    {expenseSubmitting ? 'Adding...' : 'Add Record'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Impact Gallery */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center">
                            <Camera className="w-5 h-5 mr-2 text-indigo-600" />
                            Impact Gallery - Success Highlights
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                        {impactData.images && impactData.images.length > 0 ? (
                            impactData.images.map(img => (
                                <div key={img.id} className="group relative aspect-video bg-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                                    <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
                                    {img.caption && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-white text-sm font-medium">{img.caption}</p>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No photos uploaded yet.</p>
                            </div>
                        )}
                    </div>

                    {/* Upload Image Form (Only for Club Admin) */}
                    {isClubAdmin && (
                        <div className="mt-8 pt-8 border-t border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Upload Event Photo</h3>
                            <form onSubmit={handleImageUpload} className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setImageFile(e.target.files[0])}
                                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    />
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Caption (optional)"
                                        value={imageCaption}
                                        onChange={e => setImageCaption(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all text-sm"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!imageFile || imageUploading}
                                    className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 whitespace-nowrap"
                                >
                                    {imageUploading ? 'Uploading...' : 'Upload Photo'}
                                </button>
                            </form>
                            
                            {/* Error Message for Upload */}
                            {error && (
                                <p className="mt-4 text-sm font-bold text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 animate-fadeIn flex items-center gap-2">
                                    <span>⚠</span> {error}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ImpactDashboard;
