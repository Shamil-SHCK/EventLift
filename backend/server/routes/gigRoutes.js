import express from 'express';
const router = express.Router();
import * as gigController from '../controllers/gigController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/', protect, gigController.createGig);
router.get('/my-gigs', protect, gigController.getMyGigs);
router.get('/', protect, gigController.getAllGigs);
router.put('/:id/accept', protect, gigController.acceptGig);

export default router;
