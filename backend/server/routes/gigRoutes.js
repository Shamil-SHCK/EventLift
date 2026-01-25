import express from 'express';
const router = express.Router();
import * as gigController from '../controllers/gigController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/', protect, gigController.createGig);
router.get('/my-gigs', protect, gigController.getMyGigs);
router.get('/', protect, gigController.getAllGigs);
router.put('/:id/apply', protect, gigController.applyForGig);
router.get('/:id/applicants', protect, gigController.getGigApplicants);
router.post('/manage-applicant', protect, gigController.manageApplicant);
router.get('/my-applications', protect, gigController.getMyApplications);
router.get('/accepted', protect, gigController.getAcceptedGigs);
router.put('/:id/complete', protect, gigController.markGigComplete);

export default router;
