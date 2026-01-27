import express from 'express';
import {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    sponsorEvent,
    deleteEvent,
    getEventImpact,
    addExpense,
    addImpactImage
} from '../controllers/eventController.js';
import { protect, checkVerificationStatus, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public/Open routes
router.get('/', getEvents);

// Protected routes
router.post('/', protect, checkVerificationStatus, authorize('club-admin'), upload.fields([{ name: 'poster', maxCount: 1 }, { name: 'brochure', maxCount: 1 }]), createEvent);
router.get('/:id', protect, getEventById);
router.put('/:id', protect, checkVerificationStatus, authorize('club-admin', 'administrator'), upload.fields([{ name: 'poster', maxCount: 1 }, { name: 'brochure', maxCount: 1 }]), updateEvent);
router.delete('/:id', protect, checkVerificationStatus, authorize('club-admin', 'administrator'), deleteEvent);
router.post('/:id/sponsor', protect, checkVerificationStatus, authorize('company', 'alumni-individual'), sponsorEvent);

// Impact & Transparency Routes
router.get('/:id/impact', protect, getEventImpact);
router.post('/:id/impact/expense', protect, checkVerificationStatus, authorize('club-admin'), addExpense);
router.post('/:id/impact/image', protect, checkVerificationStatus, authorize('club-admin'), upload.single('image'), addImpactImage);

export default router;
