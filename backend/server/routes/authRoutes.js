import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

import upload from '../middleware/uploadMiddleware.js';

router.post('/register', upload.single('verificationDocument'), registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
