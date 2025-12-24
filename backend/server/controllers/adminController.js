import User from '../models/User.js';

// @desc    Get all users with pending verification status
// @route   GET /api/admin/users/pending
// @access  Private/Admin
export const getPendingUsers = async (req, res) => {
    try {
        const users = await User.find({ verificationStatus: 'pending' }).select('-password -verificationDocument.data');
        const usersWithDocUrl = users.map(user => {
            const u = user.toObject();
            if (user.verificationDocument && user.verificationDocument.contentType) {
                u.verificationDocument = `api/files/user/${user._id}/document`;
            } else {
                u.verificationDocument = null;
            }
            return u;
        });
        res.json(usersWithDocUrl);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update user verification status
// @route   PUT /api/admin/verify/:userId
// @access  Private/Admin
export const verifyUser = async (req, res) => {
    try {
        const { status } = req.body; // 'verified' or 'rejected'

        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided' });
        }

        // Use findByIdAndUpdate to bypass validation of other fields
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { verificationStatus: status },
            { new: true, runValidators: false } // runValidators: false is key here
        ).select('-password -verificationDocument.data');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const u = user.toObject();
        if (user.verificationDocument && user.verificationDocument.contentType) {
            u.verificationDocument = `api/files/user/${user._id}/document`;
        } else {
            u.verificationDocument = null;
        }

        res.json({
            message: `User marked as ${status}`,
            user: u
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -verificationDocument.data');
        const usersWithDocUrl = users.map(user => {
            const u = user.toObject();
            if (user.verificationDocument && user.verificationDocument.contentType) {
                u.verificationDocument = `api/files/user/${user._id}/document`;
            } else {
                u.verificationDocument = null;
            }
            return u;
        });
        res.json(usersWithDocUrl);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Reset user password
// @route   PUT /api/admin/users/:userId/reset-password
// @access  Private/Admin
export const resetUserPassword = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.password = 'ChangeMe@123';
        await user.save();

        res.json({ message: 'Password reset successfully to ChangeMe@123' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
