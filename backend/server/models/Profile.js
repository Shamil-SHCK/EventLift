import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },
        name: {
            type: String,
        },
        clubName: {
            type: String
        },
        collegeName: {
            type: String
        },
        organizationName: {
            type: String
        },
        formerInstitution: {
            type: String
        },
        phone: {
            type: String,
        },
        logoUrl: {
            type: String,
        },
        verificationDocument: {
            data: Buffer,
            contentType: String
        },
        description: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

 const Profile = mongoose.model('Profile', profileSchema);

 export default Profile; 
