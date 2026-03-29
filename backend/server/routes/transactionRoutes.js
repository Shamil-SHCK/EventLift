import express from 'express';
import { getTransactionHistory, createGigCheckoutSession, confirmGigPayment } from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getTransactionHistory);
router.post('/gig-checkout/:id', protect, createGigCheckoutSession);
router.post('/gig-confirm', protect, confirmGigPayment);

export default router;
