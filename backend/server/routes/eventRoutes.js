import express from 'express';
import {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    sponsorEvent
} from '../controllers/eventController.js';
import { protect, checkVerificationStatus, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public/Open routes
router.get('/', getEvents);

import upload from '../middleware/uploadMiddleware.js';

// Protected routes
router.post('/', protect, checkVerificationStatus, authorize('club-admin'), upload.fields([{ name: 'poster', maxCount: 1 }, { name: 'brochure', maxCount: 1 }]), createEvent);
router.get('/:id', protect, getEventById);
router.put('/:id', protect, checkVerificationStatus, authorize('club-admin', 'administrator'), upload.fields([{ name: 'poster', maxCount: 1 }, { name: 'brochure', maxCount: 1 }]), updateEvent);
router.post('/:id/sponsor', protect, checkVerificationStatus, authorize('company', 'alumni-individual'), sponsorEvent);

export default router;
