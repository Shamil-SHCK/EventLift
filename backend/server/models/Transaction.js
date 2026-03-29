import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    },
    gig: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gig'
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['initiated', 'pending', 'completed', 'failed'],
        default: 'initiated'
    },
    stripeSessionId: {
        type: String,
        required: true
    },
    transferProofUrl: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
