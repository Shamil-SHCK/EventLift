import express from 'express';
import {
    createEvent,
    getEvents,
    getEventById,
    getEventsBatch,
    updateEvent,
    createCheckoutSession,
    confirmSponsorship,
    deleteEvent,
    getEventImpact,
    addExpense,
    addImpactImage,
    proxyPdf,
    cancelSponsorship
} from '../controllers/eventController.js';
import { protect, checkVerificationStatus, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public/Open routes
router.get('/', getEvents);
router.get('/proxy-pdf', proxyPdf);

// Protected routes
router.post('/batch', protect, getEventsBatch);
router.post('/', protect, checkVerificationStatus, authorize('club-admin'), upload.fields([{ name: 'poster', maxCount: 1 }, { name: 'brochure', maxCount: 1 }]), createEvent);
router.get('/:id', protect, getEventById);
router.put('/:id', protect, checkVerificationStatus, authorize('club-admin', 'administrator'), upload.fields([{ name: 'poster', maxCount: 1 }, { name: 'brochure', maxCount: 1 }]), updateEvent);
router.delete('/:id', protect, checkVerificationStatus, authorize('club-admin', 'administrator'), deleteEvent);
router.post('/:id/create-checkout-session', protect, checkVerificationStatus, authorize('company', 'alumni-individual'), createCheckoutSession);
router.post('/sponsor/confirm', protect, checkVerificationStatus, authorize('company', 'alumni-individual'), confirmSponsorship);
router.post('/sponsor/cancel', protect, checkVerificationStatus, authorize('company', 'alumni-individual'), cancelSponsorship);

// Impact & Transparency Routes
router.get('/:id/impact', protect, getEventImpact);
router.post('/:id/impact/expense', protect, checkVerificationStatus, authorize('club-admin'), addExpense);
router.post('/:id/impact/image', protect, checkVerificationStatus, authorize('club-admin'), upload.single('image'), addImpactImage);

export default router;
