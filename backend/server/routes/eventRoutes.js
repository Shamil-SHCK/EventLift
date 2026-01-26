
import express from 'express';
import { createEvent, getEvents, getEventById, updateEvent, deleteEvent, sponsorEvent, getLatestEvents, getMyEvents, getSponsoredEvents } from '../controllers/eventController.js';
import { protect, checkVerificationStatus, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public/Open routes
router.get('/latest', getLatestEvents);
router.get('/', getEvents);

import upload from '../middleware/uploadMiddleware.js';

// Protected routes
router.get('/my', protect, checkVerificationStatus, authorize('club-admin'), getMyEvents);
router.get('/sponsored', protect, checkVerificationStatus, authorize('company', 'alumni-individual'), getSponsoredEvents);
router.post('/', protect, checkVerificationStatus, authorize('club-admin'), upload.fields([{ name: 'poster', maxCount: 1 }, { name: 'brochure', maxCount: 1 }]), createEvent);
router.get('/:id', protect, getEventById);
router.put('/:id', protect, checkVerificationStatus, authorize('club-admin', 'administrator'), upload.fields([{ name: 'poster', maxCount: 1 }, { name: 'brochure', maxCount: 1 }]), updateEvent);
router.delete('/:id', protect, checkVerificationStatus, authorize('club-admin', 'administrator'), deleteEvent);
router.post('/:id/sponsor', protect, checkVerificationStatus, authorize('company', 'alumni-individual'), sponsorEvent);

export default router;
