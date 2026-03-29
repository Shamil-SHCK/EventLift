import express from 'express';
import { getPendingUsers, verifyUser, getAllUsers, resetUserPassword, getClubTransactions, markTransactionCompleted, uploadTransferProof, payoutGigEscrow, getEscrowGigs } from '../controllers/adminController.js';
import upload from '../middleware/uploadMiddleware.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected and restricted to administrators
router.use(protect);
router.use(authorize('administrator'));

router.get('/users/pending', getPendingUsers);
router.get('/users', getAllUsers);
router.put('/verify/:userId', verifyUser);
router.put('/users/:userId/reset-password', resetUserPassword);

router.get('/club-transactions', getClubTransactions);
router.put('/transactions/:id/complete', markTransactionCompleted);
// proof field accepts an image file; the Cloudinary URL is passed via req.file.path after multer processes it
router.put('/transactions/:id/proof', upload.single('proof'), uploadTransferProof);

router.get('/escrow/gigs', getEscrowGigs);
router.put('/escrow/gigs/:id/payout', upload.single('receipt'), payoutGigEscrow);

export default router;
