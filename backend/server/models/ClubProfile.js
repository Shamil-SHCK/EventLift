import mongoose from "mongoose";

const clubProfileSchemna = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        clubName: {
            type: String,
            required: true,
        },
        collegeName: {
            type: String,
            required: true
        },
        events: [{
            event: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Event",
                required: true
            }
        }],
        phone: {
            type: String,
        },
        logoUrl: {
            type: String,
        },
        description: {
            type: String,
        },
        team: [{
            name: { type: String, required: true },
            role: { type: String, required: true }, // e.g. 'President', 'Secretary', 'Faculty Advisor'
            photoUrl: { type: String, default: null } // Cloudinary URL
        }],
        achievements: [{
            title: { type: String, required: true },
            year: { type: String },
            description: { type: String }
        }],

        // Bank account details for fund transfers
        bankDetails: {
            accountHolderName: { type: String, default: '' },
            accountNumber:     { type: String, default: '' },
            ifscCode:          { type: String, default: '' },
            bankName:          { type: String, default: '' },
            upiId:             { type: String, default: '' },
        },

    },
    {
        timestamps: true
    }
)


const ClubProfile = mongoose.model("ClubProfile", clubProfileSchemna)

export default ClubProfile