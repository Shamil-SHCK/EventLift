import mongoose from 'mongoose';

const gigSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true }, // Backlog: Define work description 
    budget: { type: Number, required: true },      // Backlog: Define budget 
    category: { type: String, required: true },    // Backlog: Filter gigs by category 

    // Who posted it?
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyProfile', required: true },

    // Who accepted it? (Initially null)
    assignedClub: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // Backlog: Update gig status (accepted/completed)
    status: {
        type: String,
        enum: ['open', 'accepted', 'completed'],
        default: 'open'
    }
}, { timestamps: true });

export default mongoose.model('Gig', gigSchema);
