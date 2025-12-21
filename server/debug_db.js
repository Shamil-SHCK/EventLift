import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/database.js';

dotenv.config();

const debugDB = async () => {
    try {
        await connectDB();

        console.log('\n--- Checking Database Users ---');
        const users = await User.find({});
        console.log(`Found ${users.length} users in the database.`);
        console.log(JSON.stringify(users, null, 2));

        console.log('\n--- Testing Verification (Simulating Admin Action) ---');
        const pendingUser = await User.findOne({ verificationStatus: 'pending' });

        if (pendingUser) {
            console.log(`Found pending user: ${pendingUser.name} (${pendingUser.role})`);
            console.log('Attempting to approve...');

            pendingUser.verificationStatus = 'verified';
            await pendingUser.save();

            console.log('SUCCESS: User verified successfully!');
        } else {
            console.log('No pending users found to test verification.');
        }

        process.exit();
    } catch (error) {
        console.error('\n!!! ERROR in Debug Script !!!');
        console.error(error);
        process.exit(1);
    }
};

debugDB();
