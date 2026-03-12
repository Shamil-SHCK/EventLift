import User from '../models/User.js';
import ClubProfile from '../models/ClubProfile.js';
import Event from '../models/Event.js';
import EventImage from '../models/EventImage.js';
import AlumniProfile from '../models/AlumniProfile.js';

// @desc    Get all clubs for directory
// @route   GET /api/users/clubs
// @access  Private (Company or Alumni)
export const getClubsDirectory = async (req, res) => {
    try {
        const user = req.user;
        let query = { role: 'club-admin' };

        if (user.role === 'alumni-individual') {
            const alumniProfile = await AlumniProfile.findOne({ user: user._id });

            if (alumniProfile && alumniProfile.formerInstitution) {
                const institutionPattern = new RegExp(`^${alumniProfile.formerInstitution}$`, 'i');
                const matchingProfiles = await ClubProfile.find({
                    collegeName: { $regex: institutionPattern }
                });
                const matchingUserIds = matchingProfiles.map(p => p.user);
                query._id = { $in: matchingUserIds };
            } else {
                return res.json([]);
            }
        }

        const clubs = await User.find(query).populate('profile');

        const formattedClubs = clubs.map(club => ({
            _id: club._id,
            name: club.name,
            clubName: club.profile?.clubName || 'Unknown Club',
            collegeName: club.profile?.collegeName || 'Unknown College',
            description: club.profile?.description || '',
            logoUrl: club.profile?.logoUrl || null,
        }));

        return res.json(formattedClubs);

    } catch (err) {
        console.error('getClubsDirectory error:', err);
        return res.status(500).json({ message: 'Server error' });
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
            const alumniInst = requester.profile?.formerInstitution?.toLowerCase();
            const clubInst = clubProfile?.collegeName?.toLowerCase();

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
            team: clubProfile?.team || [],
            achievements: clubProfile?.achievements || [],
            createdAt: clubProfile?.createdAt,
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

        // 3. Return the Cloudinary URLs directly
        const formattedImages = images.map(img => ({
            id: img._id,
            eventId: img.eventId,
            url: img.cloudinaryUrl,
            caption: img.caption,
            createdAt: img.createdAt
        }));

        res.json(formattedImages);

    } catch (error) {
        console.error("Error fetching club impact gallery:", error);
        res.status(500).json({ message: 'Server error fetching gallery' });
    }
};
