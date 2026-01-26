
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import ClubProfile from '../models/ClubProfile.js';
import Event from '../models/Event.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Adjust path to .env if needed, assuming run from backend/server
dotenv.config({ path: join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { dbName: "sponsorship-platform" });
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

const verifyRoboClub = async () => {
    await connectDB();

    try {
        // Find Robo Club Profile (searching by clubName or similar)
        // Since we don't know the exact name, let's list all club profiles
        const clubs = await ClubProfile.find({});
        console.log(`Found ${clubs.length} clubs.`);

        let roboClub = clubs.find(c => c.clubName && c.clubName.toLowerCase().includes('robo'));

        if (!roboClub) {
            console.log("Robo Club not found by name. Listing all clubs:");
            clubs.forEach(c => console.log(`- ${c.clubName} (ID: ${c._id})`));

            // Try matching user if provided in context/logs, but for now just exit if not found
            if (clubs.length > 0) roboClub = clubs[0]; // Fallback to first club for debug if robo not found
            else { console.log("No clubs found."); process.exit(0); }
        }

        console.log(`\nInspecting Club: ${roboClub.clubName} (Profile ID: ${roboClub._id})`);
        console.log(`Events in Profile List: ${JSON.stringify(roboClub.events)}`);

        // Find events where organizer matches this profile
        const organizedEvents = await Event.find({ organizer: roboClub._id });
        console.log(`\nEvents found in Events collection with organizer=${roboClub._id}:`);
        console.log(`Count: ${organizedEvents.length}`);
        organizedEvents.forEach(e => console.log(`- ${e.title} (ID: ${e._id})`));

        // Check for mismatch
        const profileEventIds = roboClub.events.map(e => e.event.toString());
        const organizedEventIds = organizedEvents.map(e => e._id.toString());

        const missingInProfile = organizedEventIds.filter(id => !profileEventIds.includes(id));
        const missingInCollection = profileEventIds.filter(id => !organizedEventIds.includes(id));

        if (missingInProfile.length > 0) {
            console.log(`\n[WARNING] These events exist but are NOT linked in the Club Profile: ${missingInProfile}`);
        }
        if (missingInCollection.length > 0) {
            console.log(`\n[WARNING] These events are in Club Profile but NOT found in Events collection: ${missingInCollection}`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
};

verifyRoboClub();
