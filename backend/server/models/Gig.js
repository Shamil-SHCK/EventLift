import mongoose from 'mongoose';

const gigSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true }, // Backlog: Define work description 
    budget: { type: Number, required: true },      // Backlog: Define budget 
    maxBudget: { type: Number },                   // Hard limit for bidding
    winningBid: { type: Number },                  // Agreed upon amount
    category: { type: String, required: true },    // Backlog: Filter gigs by category 

    // Who posted it?
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyProfile', required: true },

    poster: {
        type: String
    },

    // Applicants
    applicants: [{
        club: { type: mongoose.Schema.Types.ObjectId, ref: 'ClubProfile' }, // Store ID of the club
        linkedInProfile: { type: String, required: true },
        bidAmount: { type: Number, required: true },
        status: { type: String, default: 'pending' },
        appliedAt: { type: Date, default: Date.now }
    }],

    // Selected Consultant/Club
    assignedClub: { type: mongoose.Schema.Types.ObjectId, ref: 'ClubProfile', default: null },

    submissionUrl: { type: String }, // Cloudinary URL for proof of work
    submissionNote: { type: String },

    feedbackHistory: [{
        comment: { type: String },
        decision: { type: String },
        timestamp: { type: Date, default: Date.now }
    }],

    adminReceipt: { type: String }, // Cloudinary receipt URL for payout to club

    status: {
        type: String,
        enum: ['open', 'assigned', 'submitted', 'revision_requested', 'approved', 'paid_to_platform', 'completed'],
        default: 'open'
    }
}, { timestamps: true });

export default mongoose.model('Gig', gigSchema);
