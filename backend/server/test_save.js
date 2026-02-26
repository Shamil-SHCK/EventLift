import mongoose from 'mongoose';
import AlumniProfile from './models/AlumniProfile.js';
import Event from './models/Event.js';
import dotenv from 'dotenv';

dotenv.config();

const testSave = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        console.log("Before Event.findOne()");
        const event = await Event.findOne();
        if (!event) {
            console.log("No event found.");
            process.exit(0);
        }
        console.log("Event.findOne() complete");

        console.log("Before AlumniProfile.findOne()");
        const profile = await AlumniProfile.findOne();
        if (!profile) {
            console.log("No alumni profile found.");
            process.exit(0);
        }

        console.log("Found profile before save:", profile.name);

        // Replicate logic
        const sponsorshipAmount = 500;
        console.log("Before findIndex()");
        const existingSponsorshipIndex = profile.sponseredEvents.findIndex(
            s => s.event && s.event.toString() === event._id.toString()
        );
        console.log("findIndex() complete. Index =", existingSponsorshipIndex);

        if (existingSponsorshipIndex > -1) {
            let currentAmount = Number(profile.sponseredEvents[existingSponsorshipIndex].amount) || 0;
            profile.sponseredEvents[existingSponsorshipIndex].amount = currentAmount + sponsorshipAmount;
        } else {
            console.log("Before push()");
            profile.sponseredEvents.push({
                event: event._id,
                amount: sponsorshipAmount
            });
            console.log("Push complete.");
        }

        console.log("Before profile.save()...");
        await profile.save();
        console.log("Profile saved successfully.");

    } catch (err) {
        console.error("ERROR DURING SAVE:", err);
    } finally {
        mongoose.disconnect();
    }
}

testSave();
