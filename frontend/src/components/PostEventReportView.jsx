import React, { useState, useEffect } from 'react';
import { getReportByEvent } from '../services/api';
import { Loader, AlertCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';

const PostEventReportView = ({ eventId, onClose }) => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const data = await getReportByEvent(eventId);
                setReport(data);
            } catch (err) {
                console.error(err);
                setError('Report not found or failed to load.');
            } finally {
                setLoading(false);
            }
        };
        if (eventId) fetchReport();
    }, [eventId]);

    const nextPhoto = () => {
        if (!report || !report.photos) return;
        setCurrentPhotoIndex((prev) => (prev + 1) % report.photos.length);
    };

    const prevPhoto = () => {
        if (!report || !report.photos) return;
        setCurrentPhotoIndex((prev) => (prev - 1 + report.photos.length) % report.photos.length);
    };

    if (loading) return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl animate-spin">
                <Loader className="w-8 h-8 text-blue-600" />
            </div>
        </div>
    );

    if (error) return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Unavailable</h3>
                <p className="text-slate-500 mb-6">{error}</p>
                <button onClick={onClose} className="px-6 py-2 bg-slate-100 font-bold text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
                    Close
                </button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-4xl relative shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">

                <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors">
                    <X className="w-5 h-5" />
                </button>

                {/* Photo Gallery Section */}
                <div className="w-full md:w-1/2 bg-slate-900 relative flex items-center justify-center p-4">
                    {report.photos && report.photos.length > 0 ? (
                        <>
                            <img
                                src={`http://localhost:5000/${report.photos[currentPhotoIndex].url}`}
                                alt="Event Report"
                                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                            />

                            {report.photos.length > 1 && (
                                <>
                                    <button onClick={prevPhoto} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors">
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button onClick={nextPhoto} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors">
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                        {report.photos.map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`w-2 h-2 rounded-full transition-all ${idx === currentPhotoIndex ? 'bg-white w-4' : 'bg-white/50'}`}
                                            ></div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="text-slate-500 flex flex-col items-center">
                            <Loader className="w-8 h-8 mb-2 opacity-50" />
                            <p>No photos available</p>
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="w-full md:w-1/2 flex flex-col">
                    <div className="p-8 border-b border-slate-100">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider rounded-full mb-3">
                            Post-Event Report
                        </span>
                        <h2 className="text-2xl font-bold font-heading text-slate-900 mb-1">{report.event?.title}</h2>
                        <div className="flex items-center text-slate-500 text-sm gap-4">
                            <span>{new Date(report.event?.date).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{report.event?.location}</span>
                        </div>
                    </div>

                    <div className="p-8 overflow-y-auto flex-1 bg-slate-50/50">
                        <h3 className="font-bold text-slate-900 mb-3 text-lg">Impact & Highlights</h3>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {report.impact}
                        </p>
                    </div>

                    <div className="p-6 border-t border-slate-100 bg-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                {report.organizer?.logoUrl ? (
                                    <img src={report.organizer.logoUrl} alt="Club" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-bold text-slate-400">C</span>
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Organized by</p>
                                <p className="font-bold text-slate-900">{report.organizer?.clubName || 'Club Admin'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostEventReportView;
