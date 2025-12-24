import Event from '../models/Event.js';
import User from '../models/User.js';

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

        const event = await Event.create({
            title,
            description,
            date,
            time,
            location,
            category,
            budget,
            organizer: req.user._id,
            poster,
            brochure
        });

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
            .populate('organizer', 'name clubName logoUrl')
            .sort({ date: 1 }); // Sort by date (nearest first)

        const eventsWithUrls = events.map(event => {
            const e = event.toObject();
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
            .populate('organizer', 'name clubName description logoUrl')
            .populate('sponsors.sponsor', 'name organizationName formerInstitution logoUrl role');

        if (event) {
            const e = event.toObject();
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

        const sponsorship = {
            sponsor: req.user._id,
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
