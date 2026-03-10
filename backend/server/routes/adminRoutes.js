import express from 'express';
import { getPendingUsers, verifyUser, getAllUsers, resetUserPassword, getClubTransactions, markTransactionCompleted } from '../controllers/adminController.js';
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

export default router;
