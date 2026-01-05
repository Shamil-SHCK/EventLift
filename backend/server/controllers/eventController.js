import Event from '../models/Event.js';
import User from '../models/User.js';
import ClubProfile from '../models/ClubProfile.js';
import AlumniProfile from '../models/AlumniProfile.js';
import CompanyProfile from '../models/CompanyProfile.js';
import { getUserProfile } from '../utils/UserProfilesHandler.js';

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Club Admin only)
export const createEvent = async (req, res) => {
    try {
        const { title, description, date, location, category, budget, time } = req.body;

        let poster = {};
        let brochure = {};

        if (req.files) {
            if (req.files.poster) {
                poster = {
                    data: req.files.poster[0].buffer,
                    contentType: req.files.poster[0].mimetype
                };
            }
            if (req.files.brochure) {
                brochure = {
                    data: req.files.brochure[0].buffer,
                    contentType: req.files.brochure[0].mimetype
                };
            }
        }
        const profile = await getUserProfile(req.user);
        const event = await Event.create({
            title,
            description,
            date,
            time,
            location,
            category,
            budget,
            organizer: profile._id,
            poster,
            brochure
        });

        // Link Event With the Profile
        if (profile) {
            const eventData = {
                event: event._id
            }
            profile.events.push(eventData);
            await profile.save();
        }
        if (!profile) {
            res.status(404).json({ message: 'Profile not found' });
        }


        // Return object with URLs
        const e = event.toObject();
        if (event.poster && event.poster.contentType) e.poster = `api/files/event/${event._id}/poster`;
        if (event.brochure && event.brochure.contentType) e.brochure = `api/files/event/${event._id}/brochure`;
        if (e.poster) delete e.poster.data;
        if (e.brochure) delete e.brochure.data;

        res.status(201).json(e);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .select('-poster.data -brochure.data')
            .populate({
                path: 'organizer',
                select: 'name clubName logoUrl'
            })
            .sort({ date: 1 }) // Sort by date (nearest first)
            .lean();
        const eventsWithUrls = events.map(event => {
            const e = event;
            // console.log(e);
            // Organizer is now ClubProfile, so clubName is directly accessible
            // Log to debug if needed
            // console.log(e.organizer);

            if (event.poster && event.poster.contentType) {
                e.poster = `api/files/event/${event._id}/poster`;
            } else {
                e.poster = null;
            }
            if (event.brochure && event.brochure.contentType) {
                e.brochure = `api/files/event/${event._id}/brochure`;
            } else {
                e.brochure = null;
            }
            return e;
        });

        res.json(eventsWithUrls);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
export const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .select('-poster.data -brochure.data')
            .populate({
                path: 'organizer',
                select: 'name clubName description logoUrl'
            })
            .populate({
                path: 'sponsors.sponsor',
                select: 'name role profile',
                populate: { path: 'profile', select: 'organizationName formerInstitution logoUrl' }
            });
            console.log(event);
        if (event) {
            const e = event.toObject();

            // Organizer is now ClubProfile, no need to flatten nested profile
            // e.organizer properties are already available

            // Flatten sponsor profiles
            if (e.sponsors) {
                e.sponsors = e.sponsors.map(s => {
                    if (s.sponsor && s.sponsor.profile) {
                        const sponsorId = s.sponsor._id; // Preserve User ID
                        s.sponsor = { ...s.sponsor, ...s.sponsor.profile };
                        s.sponsor._id = sponsorId; // Restore User ID
                        delete s.sponsor.profile;
                    }
                    return s;
                });
            }

            // Flatten sponsor profiles
            if (e.sponsors) {
                e.sponsors = e.sponsors.map(s => {
                    if (s.sponsor && s.sponsor.profile) {
                        const sponsorId = s.sponsor._id; // Preserve User ID
                        s.sponsor = { ...s.sponsor, ...s.sponsor.profile };
                        s.sponsor._id = sponsorId; // Restore User ID
                        delete s.sponsor.profile;
                    }
                    return s;
                });
            }

            if (event.poster && event.poster.contentType) e.poster = `api/files/event/${event._id}/poster`;
            else e.poster = null;

            if (event.brochure && event.brochure.contentType) e.brochure = `api/files/event/${event._id}/brochure`;
            else e.brochure = null;

            res.json(e);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Organizer only)
export const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check ownership
        // req.user._id is an objectId, event.organizer is likely an objectId
        if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'administrator') {
            return res.status(401).json({ message: 'Not authorized to update this event' });
        }

        const updateData = { ...req.body };

        if (req.files) {
            if (req.files.poster) {
                updateData.poster = {
                    data: req.files.poster[0].buffer,
                    contentType: req.files.poster[0].mimetype
                };
            }
            if (req.files.brochure) {
                updateData.brochure = {
                    data: req.files.brochure[0].buffer,
                    contentType: req.files.brochure[0].mimetype
                };
            }
        }

        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        }).select('-poster.data -brochure.data');

        const e = updatedEvent.toObject();
        if (updatedEvent.poster && updatedEvent.poster.contentType) e.poster = `api/files/event/${updatedEvent._id}/poster`;
        if (updatedEvent.brochure && updatedEvent.brochure.contentType) e.brochure = `api/files/event/${updatedEvent._id}/brochure`;

        res.json(e);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Sponsor an event
// @route   POST /api/events/:id/sponsor
// @access  Private (Company/Alumni)
export const sponsorEvent = async (req, res) => {
    try {
        const { amount } = req.body;
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.status !== 'open') {
            return res.status(400).json({ message: 'Event is not open for sponsorship' });
        }
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log(user);
        let profile;
        // if(user.role === 'club-admin') profile = await ClubProfile.findById(user.profile);
        // if(user.role === 'company') profile = await CompanyProfile.findById(user.profile);
        // if(user.role === 'alumni-individual') profile = await AlumniProfile.findById(user.profile);
        profile = await getUserProfile(user);
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        console.log(profile);
        console.log(profile.name)

        const sponsorship = {
            sponsor: user.profile,
            name: profile.organizationName ? profile.organizationName : profile.name ? profile.name : "",
            amount: Number(amount),
            date: Date.now()
        };

        event.sponsors.push(sponsorship);
        event.raised += Number(amount);

        await event.save();

        res.json({
            message: 'Sponsorship committed successfully',
            raised: event.raised,
            sponsorship
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Organizer only)
export const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check ownership
        if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'administrator') {
            return res.status(401).json({ message: 'Not authorized to delete this event' });
        }

        //Acces Event organizer profile
        const user = await User.findById(event.organizer);
        const profile = await getUserProfile(user);
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        await Event.deleteOne({ _id: event._id });
        await profile.events.pull({ event: event._id });
        await profile.save();

        res.json({ message: 'Event removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
