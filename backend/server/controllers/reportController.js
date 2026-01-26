import PostEventReport from '../models/PostEventReport.js';
import Event from '../models/Event.js';
import { getUserProfile } from '../utils/UserProfilesHandler.js';

// @desc    Create a new post-event report
// @route   POST /api/reports
// @access  Private (Club Admin)
export const createReport = async (req, res) => {
    try {
        const { eventId, impact } = req.body;

        // Validation
        if (!eventId || !impact) {
            return res.status(400).json({ message: 'Event ID and Impact details are required' });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Verify Ownership
        const profile = await getUserProfile(req.user);
        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        if (event.organizer.toString() !== profile._id.toString() && req.user.role !== 'administrator') {
            return res.status(401).json({ message: 'Not authorized to report on this event' });
        }

        // Handle Photos
        let photos = [];
        if (req.files && req.files.length > 0) {
            if (req.files.length > 5) {
                return res.status(400).json({ message: 'Maximum 5 photos allowed per report to prevent database overload.' });
            }
            photos = req.files.map(file => ({
                data: file.buffer,
                contentType: file.mimetype
            }));
        }

        const report = await PostEventReport.create({
            event: eventId,
            organizer: profile._id,
            impact,
            photos
        });

        // Mark event as completed if not already
        if (event.status !== 'completed') {
            event.status = 'completed';
            await event.save();
        }

        res.status(201).json({
            _id: report._id,
            event: report.event,
            impact: report.impact,
            photoCount: report.photos.length,
            createdAt: report.createdAt
        });

    } catch (error) {
        console.error("Create Report Error:", error);
        res.status(500).json({ message: 'Server Error creating report' });
    }
};

// @desc    Get reports (optionally by event ID)
// @route   GET /api/reports/:eventId
// @access  Public
export const getReportByEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const report = await PostEventReport.findOne({ event: eventId })
            .populate('event', 'title date location')
            .populate('organizer', 'clubName logoUrl')
            .select('-photos.data'); // Don't send heavy connection data in list view if we had one, but here strictly one.

        if (!report) {
            return res.status(404).json({ message: 'Report not found for this event' });
        }

        // Add photo URLs
        const reportObj = report.toObject();
        // Since we excluded data, we just assume photos exist by index
        // But wait, we need to serve the photos. 
        // Strategy: Provide URLs like /api/reports/image/:reportId/:photoIndex

        reportObj.photos = report.photos.map((_, index) => ({
            url: `api/reports/image/${report._id}/${index}`
        }));

        res.json(reportObj);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Serve report image
// @route   GET /api/reports/image/:id/:index
// @access  Public
export const getReportImage = async (req, res) => {
    try {
        const report = await PostEventReport.findById(req.params.id);
        if (!report || !report.photos || !report.photos[req.params.index]) {
            return res.status(404).send('Image not found');
        }

        const photo = report.photos[req.params.index];
        res.set('Content-Type', photo.contentType);
        res.send(photo.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};
