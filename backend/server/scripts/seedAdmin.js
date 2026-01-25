import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import crypto from 'crypto';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const adminEmail = 'admin@example.com';
        const adminPassword = 'adminpassword';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin user already exists');

            // Optional: Reset password if you want to be sure
            // existingAdmin.password = adminPassword;
            // await existingAdmin.save();
            // console.log('Admin password reset');
        } else {
            const user = await User.create({
                name: 'Admin User',
                email: adminEmail,
                password: adminPassword,
                role: 'administrator',
                verificationStatus: 'verified', // Ensure verified
                isEmailVerified: true
            });
            console.log('Admin user created');
        }

        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
