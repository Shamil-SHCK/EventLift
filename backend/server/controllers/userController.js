import User from '../models/User.js';
import ClubProfile from '../models/ClubProfile.js';
import Event from '../models/Event.js';
import EventImage from '../models/EventImage.js';

// @desc    Get all clubs for directory
// @route   GET /api/users/clubs
// @access  Private (Company or Alumni)
export const getClubsDirectory = async (req, res) => {
    try {
        const user = req.user;
        let query = { role: 'club-admin' };

        // If alumni, only show clubs from their former institution
        if (user.role === 'alumni-individual') {
            const alumniProfile = await user.populate('profile');
            if (alumniProfile.profile && alumniProfile.profile.formerInstitution) {
                // We need to match clubs whose profile has the same collegeName
                // Since collegeName is on the ClubProfile, we can fetch all club profiles first
                // Or we can rely on User model having collegeName (from registration)
                // Based on authController, User doesn't guarantee collegeName anymore, it's on profile.
                // So let's fetch matching profiles first.
                const matchingProfiles = await ClubProfile.find({ collegeName: alumniProfile.profile.formerInstitution });
                const matchingUserIds = matchingProfiles.map(p => p.user);
                query._id = { $in: matchingUserIds };
            } else {
                // If alumni has no institution set, they see no clubs
                return res.json([]);
            }
        }

        // Fetch users matching the query and populate their profile
        const clubs = await User.find(query).select('-password -verificationDocument -otp -otpExpire').populate({
            path: 'profile',
            select: 'clubName collegeName logoUrl description'
        });

        // Format response to send safe public data
        const formattedClubs = clubs.map(club => ({
            _id: club._id,
            name: club.name,
            clubName: club.profile?.clubName || 'Unknown Club',
            collegeName: club.profile?.collegeName || 'Unknown College',
            description: club.profile?.description || '',
            logoUrl: club.profile?.logoUrl || null,
        }));

        res.json(formattedClubs);
    } catch (error) {
        console.error("Error fetching clubs directory:", error);
        res.status(500).json({ message: 'Server error fetching clubs' });
    }
};

// @desc    Get public profile for a specific club
// @route   GET /api/users/clubs/:id
// @access  Private (Company or Alumni)
export const getClubPublicProfile = async (req, res) => {
    try {
        const clubId = req.params.id;
        const requester = req.user;

        // Fetch the target user
        const clubUser = await User.findById(clubId).select('-password -verificationDocument -otp -otpExpire').populate('profile');

        if (!clubUser || clubUser.role !== 'club-admin') {
            return res.status(404).json({ message: 'Club not found' });
        }

        const clubProfile = clubUser.profile;

        // Verify access permissions for alumni
        if (requester.role === 'alumni-individual') {
            await requester.populate('profile');
            const alumniInst = requester.profile?.formerInstitution;
            const clubInst = clubProfile?.collegeName;

            if (alumniInst !== clubInst) {
                return res.status(403).json({ message: 'You do not have permission to view clubs outside your former institution' });
            }
        }

        // Fetch events organized by this club
        const events = await Event.find({ organizer: clubId }).sort({ createdAt: -1 });

        res.json({
            _id: clubUser._id,
            name: clubUser.name,
            email: clubUser.email,
            clubName: clubProfile?.clubName || 'Unknown Club',
            collegeName: clubProfile?.collegeName || 'Unknown College',
            description: clubProfile?.description || '',
            logoUrl: clubProfile?.logoUrl || null,
            phone: clubProfile?.phone || null,
            events: events
        });

    } catch (error) {
        console.error("Error fetching club public profile:", error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};

// @desc    Get gallery images for a specific club's past events
// @route   GET /api/users/clubs/:id/gallery
// @access  Private (Company or Alumni)
export const getClubGallery = async (req, res) => {
    try {
        const clubId = req.params.id;

        // 1. Fetch all events organized by this club
        const events = await Event.find({ organizer: clubId }).select('_id');
        const eventIds = events.map(event => event._id);

        if (eventIds.length === 0) {
            return res.json([]);
        }

        // 2. Fetch all images linked to these events
        const images = await EventImage.find({ eventId: { $in: eventIds } })
            .sort({ createdAt: -1 })
            .limit(20);

        // 3. Map buffer to base64 Data URLs so frontend can use <img src="..." />
        const formattedImages = images.map(img => {
            const base64Data = img.imageData.toString('base64');
            return {
                id: img._id,
                eventId: img.eventId,
                url: `data:${img.mimeType};base64,${base64Data}`,
                caption: img.caption,
                createdAt: img.createdAt
            };
        });

        res.json(formattedImages);

    } catch (error) {
        console.error("Error fetching club impact gallery:", error);
        res.status(500).json({ message: 'Server error fetching gallery' });
    }
};
