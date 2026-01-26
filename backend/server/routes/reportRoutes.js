import express from 'express';
import { createReport, getReportByEvent, getReportImage } from '../controllers/reportController.js';
import { protect, checkVerificationStatus, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes (for viewing reports/images)
router.get('/image/:id/:index', getReportImage);
router.get('/:eventId', getReportByEvent);

// Protected routes (for creating reports)
// Only club-admin can post reports
router.post('/', protect, checkVerificationStatus, authorize('club-admin'), upload.array('photos', 5), createReport);

export default router;
