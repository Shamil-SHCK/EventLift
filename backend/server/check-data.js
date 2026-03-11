import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import ClubProfile from './models/ClubProfile.js';
import AlumniProfile from './models/AlumniProfile.js';

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Simulated from req.user
        const user = await User.findById('695b520a1e0bb31c6d1c7c91');
        
        console.log("Original User Role:", user.role);
        
        let query = { role: 'club-admin' };

        if (user.role === 'alumni-individual') {
            const alumniProfile = await AlumniProfile.findOne({ user: user._id });
            console.log("Found alumniProfile:", alumniProfile?.formerInstitution);

            if (alumniProfile && alumniProfile.formerInstitution) {
                const institutionPattern = new RegExp(`^${alumniProfile.formerInstitution}$`, 'i');
                const matchingProfiles = await ClubProfile.find({ 
                    collegeName: { $regex: institutionPattern } 
                });
                console.log(`Matching Club profiles count: ${matchingProfiles.length}`);
                
                const matchingUserIds = matchingProfiles.map(p => p.user);
                console.log("matchingUserIds:", matchingUserIds);
                
                query._id = { $in: matchingUserIds };
            } else {
                console.log("No alumniProfile or formerInstitution found");
            }
        }

        console.log("Final query:", JSON.stringify(query));
        const clubs = await User.find(query).populate('profile');
        
        console.log("Found clubs count:", clubs.length);
        if(clubs.length > 0) {
            console.log("First club populated profile:", JSON.stringify(clubs[0].profile));
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        mongoose.disconnect();
    }
};

run();