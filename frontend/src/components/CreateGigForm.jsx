import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postGig } from '../services/api/gigService';
import { ArrowLeft, IndianRupee, Briefcase, FileText, Tag, Upload } from 'lucide-react';

const CreateGigForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        budget: '',
        maxBudget: '',
        category: 'Tech', // Default
        categoryOther: ''
    });
    const [poster, setPoster] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [posterError, setPosterError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setPosterError('');
        if (file) {
            if (!file.type.startsWith('image/')) {
                setPosterError('Gig poster must be an image file');
            } else if (file.size > 5 * 1024 * 1024) {
                setPosterError('Gig poster must be less than 5MB');
            }
        }
        setPoster(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (posterError) return;
        if (poster) {
            if (!poster.type.startsWith('image/')) {
                setPosterError('Gig poster must be an image file');
                return;
            }
            if (poster.size > 5 * 1024 * 1024) {
                setPosterError('Gig poster must be less than 5MB');
                return;
            }
        }

        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'category' && formData.category === 'Other') {
                    data.append('category', formData.categoryOther || 'Other');
                } else if (key !== 'categoryOther') {
                    data.append(key, formData[key]);
                }
            });
            if (poster) data.append('poster', poster);

            await postGig(data);
            navigate(-1); // Go back to previous page (Company Dashboard)
        } catch (err) {
            console.log(err);
            setError(err.message || 'Failed to create gig');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8" >
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                </button>

                <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                    <Briefcase className="w-8 h-8 mr-3 text-indigo-600" />
                    Post a New Gig
                </h1>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gig Title</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FileText className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 border"
                                placeholder="e.g., Build a React Landing Page"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gig Poster (Image)</label>
                        <div className="flex flex-col items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500 font-sans">
                                        {poster ? <span className="text-indigo-600 font-bold">{poster.name}</span> : <span><span className="font-semibold">Click to upload</span> or drag and drop</span>}
                                    </p>
                                    <p className="text-xs text-gray-400">SVG, PNG, JPG (MAX. 5MB)</p>
                                </div>
                                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                            </label>
                            {posterError && (
                                <p className="mt-2 text-xs font-bold text-red-600 bg-red-50 p-2 rounded-lg border border-red-100 animate-fadeIn w-full text-center">
                                    ✕ {posterError}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            name="description"
                            required
                            rows="4"
                            value={formData.description}
                            onChange={handleChange}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
                            placeholder="Describe the work requirements..."
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Budget (₹)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <IndianRupee className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="number"
                                    name="budget"
                                    required
                                    min="0"
                                    value={formData.budget}
                                    onChange={handleChange}
                                    className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 border"
                                    placeholder="5000"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Max Budget Limit (₹)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <IndianRupee className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="number"
                                    name="maxBudget"
                                    required
                                    min="0"
                                    value={formData.maxBudget}
                                    onChange={handleChange}
                                    className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 border"
                                    placeholder="10000"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <div className="relative">
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 border bg-white"
                                >
                                    <option value="Tech">Tech</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Design">Design</option>
                                    <option value="Event Ops">Event Ops</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        {formData.category === 'Other' && (
                            <div className="md:col-span-2 animate-fadeIn">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Specify Category</label>
                                <input
                                    type="text"
                                    name="categoryOther"
                                    required
                                    value={formData.categoryOther}
                                    onChange={handleChange}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
                                    placeholder="e.g. Workshop, Guest Lecture, etc."
                                />
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Posting...' : 'Publish Gig'}
                    </button>
                </form>
            </div>
        </div >
    );
};

export default CreateGigForm;
