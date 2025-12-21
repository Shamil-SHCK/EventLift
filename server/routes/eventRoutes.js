import express from 'express';
import { createEvent, getEvents } from '../controllers/eventController.js';
import { protect, checkVerificationStatus } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route or Protected route (viewing events might be public?)
router.get('/', getEvents);

// Protected route with verification check
// User must be logged in (protect) AND verified (checkVerificationStatus) to create an event
router.post('/', protect, checkVerificationStatus, createEvent);

export default router;
