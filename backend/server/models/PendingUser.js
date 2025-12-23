import mongoose from 'mongoose';

const pendingUserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email',
            ],
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            minlength: [6, 'Password must be at least 6 characters'],
        },
        role: {
            type: String,
            enum: ['administrator', 'club-admin', 'alumni-individual', 'company'],
            default: 'club-admin',
        },
        clubName: { type: String },
        organizationName: { type: String },
        formerInstitution: { type: String },
        verificationDocument: { type: String },
        phone: { type: String },
        logoUrl: { type: String },
        description: { type: String },

        otp: {
            type: String,
            required: true
        },
        otpExpire: {
            type: Date,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 600 // Automatically delete after 10 minutes
        }
    }
);

// Removed pre-save hashing to avoid double hashing when moving to User model.
// The password will be hashed when the actual User document is created.

const PendingUser = mongoose.model('PendingUser', pendingUserSchema);

export default PendingUser;
