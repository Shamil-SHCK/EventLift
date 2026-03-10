import Transaction from '../models/Transaction.js';

// @desc    Get logged in user's transaction history
// @route   GET /api/transactions
// @access  Private
export const getTransactionHistory = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id })
            .populate({
                path: 'event',
                select: 'title'
            })
            .sort({ createdAt: -1 });

        res.json(transactions);
    } catch (error) {
        console.error("Fetch Transactions Error:", error);
        res.status(500).json({ message: 'Server Error fetching transactions' });
    }
};
