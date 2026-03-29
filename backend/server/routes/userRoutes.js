import express from 'express';
import {
    getClubsDirectory,
    getClubPublicProfile,
    getClubGallery,
    checkUsername,
    setUsername,
    searchUsers,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// ─── PUBLIC ROUTES ───────────────────────────────
// Check if a username is available (no auth required)
router.get('/check-username/:username', checkUsername);

// ─── PROTECTED ROUTES ────────────────────────────
// Set or update the logged-in user's username
router.patch('/set-username', protect, setUsername);

// Search users by username (requires login)
router.get('/search', protect, searchUsers);

// ─── CLUB DIRECTORY (Company / Alumni only) ───────
router.get('/clubs', protect, authorize('company', 'alumni-individual'), getClubsDirectory);
router.get('/clubs/:id', protect, authorize('company', 'alumni-individual'), getClubPublicProfile);
router.get('/clubs/:id/gallery', protect, authorize('company', 'alumni-individual'), getClubGallery);

export default router;
