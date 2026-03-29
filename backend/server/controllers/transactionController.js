import Transaction from '../models/Transaction.js';
import Stripe from 'stripe';
import Gig from '../models/Gig.js';
import CompanyProfile from '../models/CompanyProfile.js';
// @desc    Get logged in user's transaction history
// @route   GET /api/transactions
// @access  Private
export const getTransactionHistory = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id })
            .populate({
                path: 'event',
                select: 'title category'
            })
            .populate({
                path: 'gig',
                select: 'title category'
            })
            .sort({ createdAt: -1 });

        res.json(transactions);
    } catch (error) {
        console.error("Fetch Transactions Error:", error);
        res.status(500).json({ message: 'Server Error fetching transactions' });
    }
};

export const createGigCheckoutSession = async (req, res) => {
    try {
        const gig = await Gig.findById(req.params.id);

        if (!gig) {
            return res.status(404).json({ message: 'Gig not found' });
        }

        if (gig.status !== 'approved') {
            return res.status(400).json({ message: 'Gig is not approved for payment yet' });
        }

        const companyProfile = await CompanyProfile.findOne({ user: req.user._id });
        if (!companyProfile || gig.company.toString() !== companyProfile._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to pay for this gig' });
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const amount = gig.winningBid;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid winning bid amount' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: `Payment for Gig: ${gig.title}`,
                            description: `Platform escrow for gig completion.`,
                        },
                        unit_amount: amount * 100, // Amount in paise
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                gigId: gig._id.toString(),
                userId: req.user._id.toString()
            },
            success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/success?session_id={CHECKOUT_SESSION_ID}&type=gig`,
            cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/cancel?session_id={CHECKOUT_SESSION_ID}&type=gig`,
        });

        // Record initiated transaction
        await Transaction.create({
            user: req.user._id,
            gig: gig._id,
            amount: amount,
            status: 'initiated',
            stripeSessionId: session.id
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error("Stripe Create Gig Session Error:", error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

export const confirmGigPayment = async (req, res) => {
    try {
        const { session_id } = req.body;

        if (!session_id) {
            return res.status(400).json({ message: 'Session ID is required' });
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status !== 'paid') {
            return res.status(400).json({ message: 'Payment not completed' });
        }

        const { gigId } = session.metadata;

        const gig = await Gig.findById(gigId);
        if (!gig) return res.status(404).json({ message: 'Gig not found' });

        gig.status = 'paid_to_platform';
        await gig.save();

        const transaction = await Transaction.findOne({ stripeSessionId: session_id });
        if (transaction && transaction.status !== 'completed') {
            transaction.status = 'completed'; // Direct to completed as it's just platform escrow for now, or pending Admin action
            await transaction.save();
        }

        res.json({ message: 'Gig payment successfully confirmed' });
    } catch (error) {
        console.error("Stripe Confirm Gig Payment Error:", error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};
