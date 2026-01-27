import express from 'express';
const router = express.Router();
import * as gigController from '../controllers/gigController.js';
import { protect } from '../middleware/authMiddleware.js';

import upload  from '../middleware/uploadMiddleware.js';

router.post('/', protect, upload.single('poster'), gigController.createGig);
router.get('/my-gigs', protect, gigController.getMyGigs);
router.get('/', protect, gigController.getAllGigs);
router.put('/:id/apply', protect, gigController.applyForGig);
router.put('/:id/assign', protect, gigController.assignGig);
router.get('/accepted', protect, gigController.getAcceptedGigs);
router.put('/:id/complete', protect, gigController.markGigComplete);

export default router;
