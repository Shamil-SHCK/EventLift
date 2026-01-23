import React from 'react';
import { Rocket, Calendar, MapPin, DollarSign } from 'lucide-react';

const ClubEventList = ({ events, handleViewSponsors, handleEditEvent, handleDeleteEvent, openCreateModal }) => {
    if (events.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-12 text-center border dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Rocket className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Create Your First Event</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">Start by creating an event to attract sponsors and manage your fundraising campaigns effectively.</p>
                <button onClick={openCreateModal} className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                    Create Event
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
                <div key={event._id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all group">
                    <div className="h-48 bg-slate-100 relative overflow-hidden">
                        {event.poster ? (
                            <img src={`http://localhost:5000/${event.poster}`} alt={event.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                                <Rocket className="w-12 h-12" />
                            </div>
                        )}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider text-slate-700">
                            {event.category}
                        </div>
                    </div>
                    <div className="p-6">
                        <h3 className="text-xl font-bold font-heading text-slate-900 mb-2 truncate" title={event.title}>{event.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                            <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(event.date).toLocaleDateString()}</div>
                            <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.location}</div>
                        </div>
                        <div className="mb-6">
                            <div className="flex justify-between text-sm font-semibold mb-1">
                                <span className="text-slate-700">₹{event.raised || 0} raised</span>
                                <span className="text-slate-400">Target: ₹{event.budget}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 rounded-full"
                                    style={{ width: `${Math.min(100, ((event.raised || 0) / event.budget) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleViewSponsors(event)}
                                className="flex-1 py-2.5 rounded-lg border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Sponsors
                            </button>
                            <button
                                onClick={() => handleEditEvent(event)}
                                className="flex-1 py-2.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
                            >
                                Edit
                            </button>
                        </div>
                        <button
                            onClick={() => handleDeleteEvent(event._id)}
                            className="w-full mt-2 py-2 rounded-lg bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors text-sm"
                        >
                            Delete Event
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ClubEventList;
