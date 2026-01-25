import mongoose from "mongoose";


const companyProfileSchemna = mongoose.Schema(
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
            requied: true,
            unique: true
        },
        organizationName: {
            type: String,
            required: true,
        },
        sponseredEvents: [{
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
        }
    },
    {
        timestamps: true
    }
)

const CompanyProfile = mongoose.model("CompanyProfile", companyProfileSchemna)

export default CompanyProfile