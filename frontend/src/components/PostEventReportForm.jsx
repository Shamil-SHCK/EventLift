import React, { useState } from 'react';
import { createReport } from '../services/api';
import { X, Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const PostEventReportForm = ({ event, onClose, onSuccess }) => {
    const [impact, setImpact] = useState('');
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + photos.length > 5) {
            setError('Maximum 5 photos allowed.');
            return;
        }

        // Simple size check (e.g., 5MB limit per file)
        const oversized = files.some(file => file.size > 5 * 1024 * 1024);
        if (oversized) {
            setError('Each photo must be less than 5MB.');
            return;
        }

        setPhotos([...photos, ...files]);
        setError('');
    };

    const removePhoto = (index) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!impact.trim()) {
            setError("Impact details are required.");
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('eventId', event._id);
            formData.append('impact', impact);
            photos.forEach(photo => {
                formData.append('photos', photo);
            });

            await createReport(formData);
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to submit report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg relative shadow-2xl animate-fadeIn flex flex-col max-h-[90vh]">

                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold font-heading text-slate-900">Post-Event Report</h2>
                        <p className="text-sm text-slate-500 font-medium truncate max-w-[250px]">{event.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-100 transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm font-medium">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Impact Details</label>
                            <textarea
                                value={impact}
                                onChange={(e) => setImpact(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none h-32"
                                placeholder="Describe the event's success, attendance, and how sponsorship helped..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Event Photos <span className="text-slate-400 font-normal">(Max 5)</span>
                            </label>

                            <div className="grid grid-cols-3 gap-3 mb-3">
                                {photos.map((photo, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden group border border-slate-200">
                                        <img
                                            src={URL.createObjectURL(photo)}
                                            alt="preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(index)}
                                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}

                                {photos.length < 5 && (
                                    <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
                                        <Upload className="w-6 h-6 text-slate-400 mb-2" />
                                        <span className="text-xs text-slate-500 font-bold">Upload</span>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-300 hover:bg-blue-600 hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                        {loading && <Loader className="w-4 h-4 animate-spin" />}
                        Submit Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostEventReportForm;
