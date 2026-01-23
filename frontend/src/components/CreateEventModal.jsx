import React from 'react';
import { X, Upload, Calendar, Clock, MapPin, Tag, DollarSign } from 'lucide-react';

const CreateEventModal = ({
    isOpen,
    onClose,
    onSubmit,
    isEditing,
    formData,
    handleInputChange,
    files,
    handleFileChange,
    submitting
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left">
            <div className="bg-white rounded-2xl w-full max-w-2xl relative shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 border-b border-slate-100">
                    <h2 className="text-2xl font-bold font-heading text-slate-900">
                        {isEditing ? 'Edit Event' : 'Create New Event'}
                    </h2>
                    <p className="text-slate-500">
                        {isEditing ? 'Update your event details.' : 'Share your event details to attract sponsors.'}
                    </p>
                </div>

                <form onSubmit={onSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-bold text-slate-700">Event Title</label>
                            <input
                                type="text" name="title" required
                                value={formData.title} onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                                placeholder="e.g. TechNova 2025"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                <input
                                    type="date" name="date" required
                                    value={formData.date} onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                <input
                                    type="time" name="time" required
                                    value={formData.time} onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                <input
                                    type="text" name="location" required
                                    value={formData.location} onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                                    placeholder="e.g. Main Auditorium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Category</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                <select
                                    name="category" required
                                    value={formData.category} onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all appearance-none"
                                >
                                    <option value="Technical">Technical</option>
                                    <option value="Cultural">Cultural</option>
                                    <option value="Sports">Sports</option>
                                    <option value="Workshop">Workshop</option>
                                    <option value="Seminar">Seminar</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-bold text-slate-700">Description</label>
                            <textarea
                                name="description" required
                                value={formData.description} onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all min-h-[100px]"
                                placeholder="Describe your event highlights..."
                            />
                        </div>

                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-bold text-slate-700">Budget Goal (₹)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                <input
                                    type="number" name="budget" required min="0"
                                    value={formData.budget} onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                                    placeholder="50000"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Event Poster</label>
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                    <p className="text-xs text-slate-500">{files.poster ? files.poster.name : "Upload Image"}</p>
                                </div>
                                <input type="file" name="poster" onChange={handleFileChange} accept="image/*" className="hidden" />
                            </label>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Sponsorship Brochure (PDF)</label>
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                    <p className="text-xs text-slate-500">{files.brochure ? files.brochure.name : "Upload PDF"}</p>
                                </div>
                                <input type="file" name="brochure" onChange={handleFileChange} accept=".pdf" className="hidden" />
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-70"
                    >
                        {submitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Event' : 'Launch Event')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateEventModal;
