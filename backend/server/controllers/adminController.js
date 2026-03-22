import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import ClubProfile from '../models/ClubProfile.js';

// @desc    Get all users with pending verification status
// @route   GET /api/admin/users/pending
// @access  Private/Admin
export const getPendingUsers = async (req, res) => {
    try {
        const users = await User.find({ verificationStatus: 'pending' })
            .select('-password -verificationDocument.data')
            .populate('profile') // Populate profile
            .lean();

        const usersWithDocUrl = users.map(user => {
            const u = user;
            if (user.verificationDocument && user.verificationDocument.contentType) {
                u.verificationDocument = `api/files/user/${user._id}/document`;
            } else {
                u.verificationDocument = null;
            }

            if (user.profile) {
                // Merge profile into user object
                const uProfile = user.profile;
                u.clubName = uProfile.clubName;
                u.collegeName = uProfile.collegeName;
                u.organizationName = uProfile.organizationName;
                u.formerInstitution = uProfile.formerInstitution;

                // Ensure name is consistent if needed, though User.name is primary
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
            { new: true, runValidators: false }
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
        const users = await User.find()
            .select('-password -verificationDocument.data')
            .populate('profile')
            .lean();

        const usersWithDocUrl = users.map(user => {
            const u = user;

            if (user.profile) {
                const uProfile = user.profile;
                u.clubName = uProfile.clubName;
                u.collegeName = uProfile.collegeName;
                u.organizationName = uProfile.organizationName;
                u.formerInstitution = uProfile.formerInstitution;
            }

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

// @desc    Get all transactions grouped by club
// @route   GET /api/admin/club-transactions
// @access  Private/Admin
export const getClubTransactions = async (req, res) => {
    try {
        // Find all non-failed transactions
        const transactions = await Transaction.find({ status: { $in: ['pending', 'completed'] } })
            .populate({
                path: 'event',
                select: 'title organizer',
            })
            .populate({
                path: 'user',
                select: 'name email profile',
            })
            .sort({ createdAt: -1 })
            .lean();

        // Group by Club Admin (organizer ID)
        const grouped = {};
        for (const tx of transactions) {
            if (!tx.event || !tx.event.organizer) continue;
            
            const clubId = tx.event.organizer.toString();
            if (!grouped[clubId]) {
                // Fetch club profile for name using ID (since event.organizer is a ref to ClubProfile)
                const clubProfile = await ClubProfile.findById(clubId);
                grouped[clubId] = {
                    clubId,
                    clubName: clubProfile?.clubName || 'Unknown Club',
                    collegeName: clubProfile?.collegeName || '',
                    phone: clubProfile?.phone || '',
                    bankDetails: clubProfile?.bankDetails || {},
                    totalPending: 0,
                    totalCompleted: 0,
                    transactions: []
                };
            }

            grouped[clubId].transactions.push(tx);
            if (tx.status === 'pending') {
                grouped[clubId].totalPending += tx.amount;
            } else if (tx.status === 'completed') {
                grouped[clubId].totalCompleted += tx.amount;
            }
        }

        res.json(Object.values(grouped));
    } catch (error) {
        console.error("Admin Fetch Transactions Error:", error);
        res.status(500).json({ message: 'Server Error fetching club transactions' });
    }
};

// @desc    Mark a pending transaction as completed
// @route   PUT /api/admin/transactions/:id/complete
// @access  Private/Admin
export const markTransactionCompleted = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (transaction.status !== 'pending') {
            return res.status(400).json({ message: 'Transaction must be pending to mark as complete' });
        }

        transaction.status = 'completed';
        await transaction.save();

        res.json({ message: 'Transaction marked as completed', transaction });
    } catch (error) {
        console.error("Admin Complete Transaction Error:", error);
        res.status(500).json({ message: 'Server Error updating transaction' });
    }
};

// @desc    Upload transfer proof for a transaction (Cloudinary URL) and mark completed
// @route   PUT /api/admin/transactions/:id/proof
// @access  Private/Admin
export const uploadTransferProof = async (req, res) => {
    try {
        // multer-storage-cloudinary puts the secure URL in req.file.path
        const transferProofUrl = req.file?.path || req.body?.transferProofUrl;
        if (!transferProofUrl) {
            return res.status(400).json({ message: 'No proof file uploaded' });
        }

        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        transaction.transferProofUrl = transferProofUrl;
        transaction.status = 'completed';
        await transaction.save();

        res.json({ message: 'Transfer proof uploaded and transaction marked completed', transaction });
    } catch (error) {
        console.error('Upload Transfer Proof Error:', error);
        res.status(500).json({ message: 'Server Error uploading proof' });
    }
};
