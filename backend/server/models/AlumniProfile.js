import mongoose from "mongoose";


const AlumniProfileSchemna = mongoose.Schema(
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
        formerInstitution: {
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


const AlumniProfile = mongoose.model("AlumniProfile", AlumniProfileSchemna)

export default AlumniProfile