import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/database.js';

dotenv.config();

// connectDB(); // Removing top level call

const importData = async () => {
    try {
        await connectDB(); // Connecting here logic
        await User.deleteMany({ email: 'admin@example.com' });

        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            role: 'administrator',
            verificationStatus: 'verified' // Explicitly set, though admins bypass check
        });

        console.log('Admin user created successfully!');
        console.log('Email: admin@example.com');
        console.log('Password: password123');

        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
