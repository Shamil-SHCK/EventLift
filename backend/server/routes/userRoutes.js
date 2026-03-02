import express from 'express';
import { getClubsDirectory, getClubPublicProfile, getClubGallery } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only companies and alumni can access the club directory network
router.use(protect);
router.use(authorize('company', 'alumni-individual'));

router.route('/clubs').get(getClubsDirectory);
router.route('/clubs/:id').get(getClubPublicProfile);
router.route('/clubs/:id/gallery').get(getClubGallery);

export default router;
