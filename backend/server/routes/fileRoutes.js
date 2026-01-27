import express from 'express';
import { getUserDocument, getEventPoster, getEventBrochure, getGigPoster } from '../controllers/fileController.js';

const router = express.Router();

router.get('/user/:id/document', getUserDocument);
router.get('/event/:id/poster', getEventPoster);
router.get('/gig/:id/poster', getGigPoster);
router.get('/event/:id/brochure', getEventBrochure);

export default router;
