import mongoose from 'mongoose';

const gigSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true }, // Backlog: Define work description 
    budget: { type: Number, required: true },      // Backlog: Define budget 
    category: { type: String, required: true },    // Backlog: Filter gigs by category 

    // Who posted it?
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyProfile', required: true },

    poster: {
        data: Buffer,
        contentType: String
    },

    // Applicants
    applicants: [{
        club: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Store UserID of the club admin
        linkedInProfile: { type: String, required: true },
        appliedAt: { type: Date, default: Date.now }
    }],

    // Selected Consultant/Club
    assignedClub: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    status: {
        type: String,
        enum: ['open', 'assigned', 'completed'],
        default: 'open'
    }
}, { timestamps: true });

export default mongoose.model('Gig', gigSchema);
