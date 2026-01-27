import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Venue', 'Catering', 'Logistics', 'Marketing', 'Prizes', 'Miscellaneous']
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: false
    }
}, { timestamps: true });

export default mongoose.model('Expense', expenseSchema);
