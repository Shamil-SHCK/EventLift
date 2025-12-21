import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Role-based authorization middleware
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role '${req.user.role}' is not authorized to access this route`,
            });
        }
        next();
    };
};
// Middleware to check if user is verified
export const checkVerificationStatus = (req, res, next) => {
    // If user is not logged in, protect middleware handles it.
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    // Admins bypass verification checks
    if (req.user.role === 'administrator') {
        return next();
    }

    // Allow GET requests (viewing dashboard/profile) for everyone
    if (req.method === 'GET') {
        return next();
    }

    // Block other actions if not verified
    if (req.user.verificationStatus !== 'verified') {
        return res.status(403).json({
            message: `Account is ${req.user.verificationStatus}. You cannot perform this action until verified.`
        });
    }

    next();
};
