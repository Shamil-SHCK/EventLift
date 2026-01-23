import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Gig from '../models/Gig.js';
import User from '../models/User.js';
import CompanyProfile from '../models/CompanyProfile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const connectDB = async () => {
    try {
        console.log("Loading .env from:", path.join(__dirname, '../.env'));
        console.log("MONGODB_URI present:", !!process.env.MONGODB_URI);
        const conn = await mongoose.connect(process.env.MONGODB_URI, { dbName: "sponsorship-platform" });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const migrateGigs = async () => {
    await connectDB();

    try {
        console.log('Starting Gig Migration...');
        const gigs = await Gig.find({});
        console.log(`Found ${gigs.length} gigs.`);

        let updatedCount = 0;
        let skippedCount = 0;

        for (const gig of gigs) {
            // Check if current company field is a User ID
            // We can try to finding it in User collection
            const user = await User.findById(gig.company);

            if (user && user.role === 'company') {
                // If it is a user, find their profile
                const profile = await CompanyProfile.findOne({ user: user._id });
                if (profile) {
                    gig.company = profile._id;
                    await gig.save();
                    console.log(`Migrated Gig "${gig.title}" to CompanyProfile ${profile._id}`);
                    updatedCount++;
                } else {
                    console.log(`Skipped Gig "${gig.title}" - CompanyProfile not found for User ${user._id}`);
                    skippedCount++;
                }
            } else {
                // It might already be a profile ID or invalid
                console.log(`Skipping Gig "${gig.title}" - Company field ${gig.company} is not a valid Company User or already migrated.`);
                skippedCount++;
            }
        }

        console.log('Migration Complete.');
        console.log(`Updated: ${updatedCount}`);
        console.log(`Skipped: ${skippedCount}`);
        process.exit();

    } catch (error) {
        console.error('Migration Error:', error);
        process.exit(1);
    }
};

migrateGigs();
