import Event from '../models/Event.js';
import User from '../models/User.js';
import ClubProfile from '../models/ClubProfile.js';
import AlumniProfile from '../models/AlumniProfile.js';
import CompanyProfile from '../models/CompanyProfile.js';
import Expense from '../models/Expense.js';
import EventImage from '../models/EventImage.js';
import { getUserProfile } from '../utils/UserProfilesHandler.js';

// @desc    Get event impact details
// @route   GET /api/events/:id/impact
// @access  Private
export const getEventImpact = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const today = new Date();
        const eventDate = new Date(event.date); // Assuming 'date' is the relevant date
        // If event is in the future, return 'ongoing' status
        if (eventDate > today) {
            return res.json({
                status: 'ongoing',
                message: 'Event is still ongoing. Impact report will be available after the event.',
                event: {
                    title: event.title,
                    date: event.date
                }
            });
        }

        const expenses = await Expense.find({ eventId: event._id });
        const imagesDocs = await EventImage.find({ eventId: event._id });

        const images = imagesDocs.map(img => ({
            id: img._id, // Map _id to id
            url: `data:${img.mimeType};base64,${img.imageData.toString('base64')}`,
            caption: img.caption
        }));

        res.json({
            status: 'completed',
            event: {
                title: event.title,
                date: event.date,
                raised: event.raised,
                budget: event.budget
            },
            expenses: expenses.map(e => ({
                id: e._id,
                category: e.category,
                amount: e.amount,
                description: e.description
            })),
            images
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add event expense
// @route   POST /api/events/:id/impact/expense
// @access  Private (Club Admin)
export const addExpense = async (req, res) => {
    try {
        const { category, amount, description } = req.body;
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Authorization Check (Ensure user is the organizer)
        // Note: req.user.profile is the ID of the profile document
        // event.organizer is the ID of the ClubProfile
        if (event.organizer.toString() !== req.user.profile.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const expense = await Expense.create({
            eventId: event._id,
            category,
            amount: Number(amount),
            description
        });

        res.status(201).json(expense);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add impact image
// @route   POST /api/events/:id/impact/image
// @access  Private (Club Admin)
export const addImpactImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Authorization Check
        if (event.organizer.toString() !== req.user.profile.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const image = await EventImage.create({
            eventId: event._id,
            imageData: req.file.buffer,
            mimeType: req.file.mimetype,
            caption: req.body.caption || ''
        });

        res.status(201).json({
            id: image._id,
            caption: image.caption
            // Don't return full buffer
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Club Admin only)
export const createEvent = async (req, res) => {
    try {
        const { title, description, date, location, category, budget, time } = req.body;

        const eventDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (eventDate < today) {
            return res.status(400).json({ message: 'Event date cannot be in the past' });
        }

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
        const event = await Event.findById(req.params.id).select("-poster.data -brochure.data");

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check ownership
        // req.user._id is an objectId, event.organizer is likely an objectId
        if (event.organizer.toString() !== req.user.profile.toString()) {
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
// @desc    Sponsor an event
// @route   POST /api/events/:id/sponsor
// @access  Private (Company/Alumni)
export const sponsorEvent = async (req, res) => {
    try {
        const { amount } = req.body;
        const sponsorshipAmount = Number(amount);
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
        profile = await getUserProfile(user);
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        console.log(profile);
        console.log(profile.name)

        if (profile) {
            const existingSponsorshipIndex = event.sponsors.findIndex(
                s => s.sponsor.toString() === user.profile.toString()
            );
            if (existingSponsorshipIndex > -1) {
                event.sponsors[existingSponsorshipIndex].amount += sponsorshipAmount;
            }
            else {
                const sponsorship = {
                    sponsor: user.profile,
                    name: profile.organizationName ? profile.organizationName : profile.name ? profile.name : "",
                    amount: Number(amount),
                    date: Date.now()
                };
                event.sponsors.push(sponsorship);
                event.raised += sponsorshipAmount;
            }
        }

        await event.save();

        // Add to Sponsor Profile
        if (profile) {
            if (!profile.sponseredEvents) profile.sponseredEvents = [];

            // Check if already sponsored this event
            const existingSponsorshipIndex = profile.sponseredEvents.findIndex(
                s => s.event.toString() === event._id.toString()
            );

            if (existingSponsorshipIndex > -1) {
                // Determine current amount (handle missing 'amount' field in legacy data if valid number)
                let currentAmount = Number(profile.sponseredEvents[existingSponsorshipIndex].amount) || 0;
                profile.sponseredEvents[existingSponsorshipIndex].amount = currentAmount + sponsorshipAmount;
            } else {
                profile.sponseredEvents.push({
                    event: event._id,
                    amount: sponsorshipAmount
                });
            }

            await profile.save();
        }

        res.json({
            message: 'Sponsorship committed successfully',
            raised: event.raised,
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
        if (event.organizer.toString() !== req.user.profile.toString() && req.user.role !== 'administrator') {
            return res.status(401).json({ message: 'Not authorized to delete this event' });
        }

        //Acces Event organizer profile
        const user = await User.findById(req.user._id);
        const profile = await getUserProfile(user);
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        await Event.deleteOne({ _id: event._id });
        await profile.events.pull({ event: event._id });
        await profile.save();

        // Remove from Club Profile
        const clubProfile = await ClubProfile.findOne({ user: req.user._id });
        if (clubProfile) {
            clubProfile.events = clubProfile.events.filter(e => e.event.toString() !== req.params.id);
            await clubProfile.save();
        }

        res.json({ message: 'Event removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
