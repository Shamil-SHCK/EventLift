import mongoose from 'mongoose';

const gigSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true }, // Backlog: Define work description 
    budget: { type: Number, required: true },      // Backlog: Define budget 
    category: { type: String, required: true },    // Backlog: Filter gigs by category 

    // Who posted it?
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyProfile', required: true },

    // Who accepted it? (Initially null, set when company accepts an applicant)
    assignedClub: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // Applicants list
    applicants: [{
        club: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending'
        },
        appliedAt: { type: Date, default: Date.now }
    }],

    status: {
        type: String,
        enum: ['open', 'accepted', 'completed'],
        default: 'open'
    }
}, { timestamps: true });

export default mongoose.model('Gig', gigSchema);
