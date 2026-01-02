import User from '../models/User.js';
import Event from '../models/Event.js';
import PendingUser from '../models/PendingUser.js';

// @desc    Get user verification document
// @route   GET /api/files/user/:id/document
// @access  Private (Admin or Owner)
// @desc    Get user verification document
// @route   GET /api/files/user/:id/document
// @access  Private (Admin or Owner)
export const getUserDocument = async (req, res) => {
    try {
        let user = await User.findById(req.params.id);

        let doc = null;

        if (user) {
            doc = user.verificationDocument;
        }

        // If not in main User or Profile, check PendingUser (for admin verification during registration)
        if (!doc) {
            const pendingUser = await PendingUser.findById(req.params.id);
            if (pendingUser) {
                doc = pendingUser.verificationDocument;
            }
        }

        if (!doc || !doc.data) {
            return res.status(404).send('Document not found');
        }

        res.set('Content-Type', doc.contentType);
        res.send(doc.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// @desc    Get event poster
// @route   GET /api/files/event/:id/poster
// @access  Public
export const getEventPoster = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event || !event.poster || !event.poster.data) {
            return res.status(404).send('Poster not found');
        }

        res.set('Content-Type', event.poster.contentType);
        res.send(event.poster.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

// @desc    Get event brochure
// @route   GET /api/files/event/:id/brochure
// @access  Public
export const getEventBrochure = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event || !event.brochure || !event.brochure.data) {
            return res.status(404).send('Brochure not found');
        }

        res.set('Content-Type', event.brochure.contentType);
        res.send(event.brochure.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};
