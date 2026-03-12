import Event from '../models/Event.js';
import User from '../models/User.js';
import ClubProfile from '../models/ClubProfile.js';
import AlumniProfile from '../models/AlumniProfile.js';
import CompanyProfile from '../models/CompanyProfile.js';
import Expense from '../models/Expense.js';
import EventImage from '../models/EventImage.js';
import Transaction from '../models/Transaction.js';
import { getUserProfile } from '../utils/UserProfilesHandler.js';
import Stripe from 'stripe';

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
            id: img._id,
            url: img.cloudinaryUrl,
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

import { v2 as cloudinary } from 'cloudinary';

// @desc    Proxy PDF to bypass Cloudinary inline restrictions
// @route   GET /api/events/proxy-pdf
// @access  Public
export const proxyPdf = async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ message: 'URL is required' });

        if (!url.includes('cloudinary.com')) {
             return res.status(400).json({ message: 'Invalid URL' });
        }

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        // Parse public ID from URL:
        // https://res.cloudinary.com/<cloud_name>/<resource_type>/upload/v<version>/<public_id>.pdf
        const uploadIndex = url.indexOf('/upload/');
        if (uploadIndex === -1) return res.status(400).json({ message: 'Invalid Cloudinary URL' });

        let urlParts = url.substring(uploadIndex + 8).split('/');
        
        // Remove version string if present (v1234567)
        if (urlParts[0].startsWith('v') && !isNaN(urlParts[0].substring(1))) {
            urlParts.shift();
        }
        
        let pathStr = urlParts.join('/').split('?')[0];
        const resourceType = url.includes('/raw/upload/') ? 'raw' : 'image';

        // Generate a signed delivery URL to bypass free-tier PDF restrictions
        const signedUrl = cloudinary.url(pathStr, {
            resource_type: resourceType,
            sign_url: true,
            secure: true
        });

        const response = await fetch(signedUrl);
        
        if (!response.ok) {
            return res.status(response.status).json({ message: 'Failed to fetch PDF from Cloudinary' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline');
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        res.send(buffer);
    } catch (error) {
        console.error('PDF Proxy Error:', error);
        res.status(error.http_code || 500).json({ message: 'Server Error', error: error.message });
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

        // req.file.path is the Cloudinary secure URL (set by multer-storage-cloudinary)
        const image = await EventImage.create({
            eventId: event._id,
            cloudinaryUrl: req.file.path,
            caption: req.body.caption || ''
        });

        res.status(201).json({
            id: image._id,
            url: image.cloudinaryUrl,
            caption: image.caption
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

        let posterUrl = '';
        let brochureUrl = '';

        if (req.files) {
            if (req.files.poster) {
                posterUrl = req.files.poster[0].path; // Cloudinary URL
            }
            if (req.files.brochure) {
                brochureUrl = req.files.brochure[0].path; // Cloudinary URL
            }
        }
        const profile = await getUserProfile(req.user);

        if (!profile) {
            return res.status(404).json({ message: 'Club profile not found' });
        }

        const event = await Event.create({
            title,
            description,
            date,
            time,
            location,
            category,
            budget,
            organizer: profile._id,
            poster: posterUrl,
            brochure: brochureUrl
        });

        // Link Event With the Profile
        const eventData = {
            event: event._id
        }
        profile.events.push(eventData);
        await profile.save();

        res.status(201).json(event);
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
                select: 'name clubName collegeName logoUrl'
            })
            .sort({ date: 1 }) // Sort by date (nearest first)
            .lean();

        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get batch events by ID array
// @route   POST /api/events/batch
// @access  Private
export const getEventsBatch = async (req, res) => {
    try {
        const { eventIds } = req.body;
        
        if (!eventIds || !Array.isArray(eventIds)) {
            return res.status(400).json({ message: 'Please provide an array of event IDs' });
        }

        const events = await Event.find({ _id: { $in: eventIds } })
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

        // Flatten sponsor profiles similar to getEventById
        const formattedEvents = events.map(event => {
            const e = event.toObject();
            if (e.sponsors) {
                e.sponsors = e.sponsors.map(s => {
                    if (s.sponsor && s.sponsor.profile) {
                        const sponsorId = s.sponsor._id; 
                        s.sponsor = { ...s.sponsor, ...s.sponsor.profile };
                        s.sponsor._id = sponsorId; 
                        delete s.sponsor.profile;
                    }
                    return s;
                });
            }
            return e;
        });

        res.json(formattedEvents);
    } catch (error) {
        console.error('Error in batch fetch:', error);
        res.status(500).json({ message: 'Server Error during batch fetch' });
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
                updateData.poster = req.files.poster[0].path;
            }
            if (req.files.brochure) {
                updateData.brochure = req.files.brochure[0].path;
            }
        }

        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        res.json(updatedEvent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create Stripe Checkout Session for Sponsorship
// @route   POST /api/events/:id/create-checkout-session
// @access  Private (Company/Alumni)
export const createCheckoutSession = async (req, res) => {
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

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: `Sponsorship for ${event.title}`,
                            description: `Supporting event organized by clubs on the platform.`,
                        },
                        unit_amount: sponsorshipAmount * 100, // Amount in paise
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                eventId: event._id.toString(),
                userId: req.user._id.toString(),
                amount: amount.toString()
            },
            success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/cancel?session_id={CHECKOUT_SESSION_ID}`,
        });

        // Record initiated transaction
        await Transaction.create({
            user: req.user._id,
            event: event._id,
            amount: sponsorshipAmount,
            status: 'initiated',
            stripeSessionId: session.id
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error("Stripe Create Session Error:", error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Confirm sponsorship payment success
// @route   POST /api/events/sponsor/confirm
// @access  Private
export const confirmSponsorship = async (req, res) => {
    try {
        const { session_id } = req.body;

        if (!session_id) {
            return res.status(400).json({ message: 'Session ID is required' });
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        // Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status !== 'paid') {
            return res.status(400).json({ message: 'Payment not completed' });
        }

        const { eventId, userId, amount } = session.metadata;
        const sponsorshipAmount = Number(amount);

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        let profile = await getUserProfile(user);
        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        // Check if already processed (idempotency check by checking if we have a record recent enough or by metadata, for simplicity we assume redirect happens once)
        // A robust way is to store stripe session_id in the sponsorship, but here we just process it.
        // To prevent double processing, we could check if a sponsorship with this amount happened recently, or ideally save the session_id in processed list.
        // Here we just follow the original logic and add the sponsorship.

        // Find existing sponsorship
        const existingSponsorshipIndex = event.sponsors.findIndex(
            s => s.sponsor && s.sponsor.toString() === profile._id.toString()
        );

        if (existingSponsorshipIndex > -1) {
            event.sponsors[existingSponsorshipIndex].amount += sponsorshipAmount;
        } else {
            const sponsorName = profile.organizationName ? profile.organizationName : (profile.name || user.name || "Anonymous");

            const sponsorship = {
                sponsor: profile._id,
                name: sponsorName,
                amount: sponsorshipAmount,
                date: Date.now()
            };
            event.sponsors.push(sponsorship);
        }

        event.raised += sponsorshipAmount;
        await event.save();

        // Add to Sponsor Profile
        if (!profile.sponseredEvents) profile.sponseredEvents = [];

        const profileSponsorshipIndex = profile.sponseredEvents.findIndex(
            s => s.event && s.event.toString() === event._id.toString()
        );

        if (profileSponsorshipIndex > -1) {
            let currentAmount = Number(profile.sponseredEvents[profileSponsorshipIndex].amount) || 0;
            profile.sponseredEvents[profileSponsorshipIndex].amount = currentAmount + sponsorshipAmount;
        } else {
            profile.sponseredEvents.push({
                event: event._id,
                amount: sponsorshipAmount
            });
        }

        profile.sponseredEvents.forEach(item => {
            if (item.amount === undefined || item.amount === null) item.amount = 0;
        });

        await profile.save();

        // Mark transaction as pending transfer
        const transaction = await Transaction.findOne({ stripeSessionId: session_id });
        if (transaction && transaction.status !== 'pending' && transaction.status !== 'completed') {
            transaction.status = 'pending';
            await transaction.save();
        }

        res.json({ message: 'Sponsorship successfully confirmed' });

    } catch (error) {
        console.error("Stripe Confirm Payment Error:", error);
        res.status(500).json({ message: error.message || 'Server Error during confirmation' });
    }
};

// @desc    Cancel sponsorship payment attempt
// @route   POST /api/events/sponsor/cancel
// @access  Private
export const cancelSponsorship = async (req, res) => {
    try {
        const { session_id } = req.body;
        if (!session_id) {
            return res.status(400).json({ message: 'Session ID is required' });
        }

        const transaction = await Transaction.findOne({ stripeSessionId: session_id });
        if (transaction && transaction.status === 'initiated') {
            transaction.status = 'failed';
            await transaction.save();
        }

        res.json({ message: 'Payment marked as cancelled/failed' });
    } catch (error) {
        console.error("Stripe Cancel Payment Error:", error);
        res.status(500).json({ message: error.message || 'Server Error during cancellation' });
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

        // Prevent deletion if event has sponsors
        if (event.sponsors && event.sponsors.length > 0) {
            return res.status(400).json({ message: 'Cannot delete an event that has already received sponsorship. Please contact an administrator.' });
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
