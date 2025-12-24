import User from '../models/User.js';
import Event from '../models/Event.js';
import PendingUser from '../models/PendingUser.js';

// @desc    Get user verification document
// @route   GET /api/files/user/:id/document
// @access  Private (Admin or Owner)
export const getUserDocument = async (req, res) => {
    try {
        let user = await User.findById(req.params.id);

        // If not in main User, check PendingUser (for admin verification)
        if (!user) {
            user = await PendingUser.findById(req.params.id);
        }

        if (!user || !user.verificationDocument || !user.verificationDocument.data) {
            return res.status(404).send('Document not found');
        }

        res.set('Content-Type', user.verificationDocument.contentType);
        res.send(user.verificationDocument.data);
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
