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

        // ── Ranking Score Engine ──────────────────────────────────────────────
        // Max 100 pts breakdown:
        //   40 pts → Sponsorship raised    (logarithmic, saturates at ₹5 lakh)
        //   25 pts → Total events count    (saturates at 20 events)
        //   20 pts → Consistency           (distinct months with events, saturates at 12)
        //   10 pts → Profile completeness  (logo 4 + description 4 + phone 2)
        //    5 pts → Achievements listed   (saturates at 5 achievements)

        const MAX_RAISED_LOG = Math.log(500_000 + 1);

        const scoredClubs = await Promise.all(clubs.map(async (club) => {
            const profile = club.profile || {};

            // All events organised by this club
            const events = profile._id
                ? await Event.find({ organizer: profile._id })
                : [];

            // 1. Sponsorship score (40 pts)
            const totalRaised = events.reduce((sum, e) => sum + (e.raised || 0), 0);
            const sponsorshipScore = totalRaised > 0
                ? Math.min(40, (Math.log(totalRaised + 1) / MAX_RAISED_LOG) * 40)
                : 0;

            // 2. Events count score (25 pts)
            const eventCount = events.length;
            const eventsScore = Math.min(25, (eventCount / 20) * 25);

            // 3. Consistency score (20 pts)
            // Count distinct calendar months that had at least one event
            const months = new Set(
                events.map(e => {
                    const d = new Date(e.date);
                    return `${d.getFullYear()}-${d.getMonth()}`;
                })
            );
            const consistencyScore = Math.min(20, (months.size / 12) * 20);

            // 4. Profile completeness (10 pts)
            let completenessScore = 0;
            if (profile.logoUrl)     completenessScore += 4;
            if (profile.description) completenessScore += 4;
            if (profile.phone)       completenessScore += 2;

            // 5. Achievements (5 pts)
            const achievementCount = (profile.achievements || []).length;
            const achievementsScore = Math.min(5, (achievementCount / 5) * 5);

            const score = Math.round(
                sponsorshipScore + eventsScore + consistencyScore +
                completenessScore + achievementsScore
            );

            const tier =
                score >= 80 ? 'Platinum' :
                score >= 55 ? 'Gold'     :
                score >= 30 ? 'Silver'   : 'Bronze';

            return {
                _id: club._id,
                name: club.name,
                clubName: profile.clubName || 'Unknown Club',
                collegeName: profile.collegeName || 'Unknown College',
                description: profile.description || '',
                logoUrl: profile.logoUrl || null,
                score,
                tier,
                stats: {
                    totalRaised,
                    eventCount,
                    consistentMonths: months.size,
                    achievementCount,
                },
            };
        }));

        // Sort by score desc, then attach rank number
        scoredClubs.sort((a, b) => b.score - a.score);
        scoredClubs.forEach((club, i) => { club.rank = i + 1; });

        return res.json(scoredClubs);

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

        // Fetch events organized by this club (organizer is the ClubProfile ID)
        const events = await Event.find({ organizer: clubProfile._id }).sort({ date: -1 });

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

        // 1. Fetch all events organized by this club (organizer is the ClubProfile ID)
        const clubUser = await User.findById(clubId).populate('profile');
        if (!clubUser || !clubUser.profile) return res.json([]);
        
        const events = await Event.find({ organizer: clubUser.profile._id }).select('_id');
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

// ─────────────────────────────────────────────
// USERNAME SYSTEM
// ─────────────────────────────────────────────

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

// @desc    Check if a username is available
// @route   GET /api/users/check-username/:username
// @access  Public
export const checkUsername = async (req, res) => {
    try {
        const { username } = req.params;

        if (!username || username.length < 3 || username.length > 20 || !USERNAME_REGEX.test(username)) {
            return res.json({ available: false });
        }

        const existing = await User.findOne({ username: username.trim() });
        return res.json({ available: !existing });
    } catch (error) {
        console.error('checkUsername error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Set or update username for the logged-in user
// @route   PATCH /api/users/set-username
// @access  Private
export const setUsername = async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        const trimmed = username.trim();

        if (trimmed.length < 3) {
            return res.status(400).json({ message: 'Username must be at least 3 characters' });
        }
        if (trimmed.length > 20) {
            return res.status(400).json({ message: 'Username must be at most 20 characters' });
        }
        if (!USERNAME_REGEX.test(trimmed)) {
            return res.status(400).json({ message: 'Username can only contain letters, numbers, and underscores' });
        }

        // Check uniqueness (exclude current user in case they are updating to same value)
        const existing = await User.findOne({ username: trimmed, _id: { $ne: req.user._id } });
        if (existing) {
            return res.status(400).json({ message: 'Username is already taken' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { username: trimmed },
            { new: true, runValidators: true }
        ).select('-password -verificationDocument -otp -otpExpire');

        return res.json({
            message: 'Username set successfully',
            user: updatedUser,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Username is already taken' });
        }
        console.error('setUsername error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get public profile by username
// @route   GET /api/profile/:username
// @access  Public
export const getProfileByUsername = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username })
            .select('-password -verificationDocument -otp -otpExpire')
            .populate('profile');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch events for this user (if it's a club)
        let events = [];
        if (user.role === 'club-admin' && user.profile) {
            events = await Event.find({ organizer: user.profile._id }).sort({ date: -1 });
        } else {
            events = await Event.find({ organizer: user._id }).sort({ date: -1 });
        }

        // Fetch gallery images from their events
        const eventIds = events.map(e => e._id);
        let gallery = [];
        if (eventIds.length > 0) {
            const images = await EventImage.find({ eventId: { $in: eventIds } })
                .sort({ createdAt: -1 })
                .limit(20);
            gallery = images.map(img => ({
                id: img._id,
                eventId: img.eventId,
                url: img.cloudinaryUrl,
                caption: img.caption,
                createdAt: img.createdAt,
            }));
        }

        if (user.role === 'alumni-individual' && user.profile) {
            const sponsored = user.profile.sponseredEvents || [];
            const totalContribution = sponsored.reduce((acc, curr) => acc + (curr.amount || 0), 0);
            const eventsSupportedCount = sponsored.length;

            return res.json({
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                profile: user.profile,
                totalContribution,
                eventsSupportedCount,
            });
        }

        return res.json({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
            profile: user.profile,
            events,
            gallery,
        });
    } catch (error) {
        console.error('getProfileByUsername error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Search users by username
// @route   GET /api/users/search?q=query
// @access  Private
export const searchUsers = async (req, res) => {
    try {
        const q = req.query.q?.trim();
        if (!q || q.length < 1) {
            return res.json([]);
        }

        const users = await User.find({
            username: { $regex: q, $options: 'i' }
        })
            .select('name username role profile profileType')
            .populate('profile', 'logoUrl clubName')
            .limit(20);

        const results = users.map(u => ({
            _id: u._id,
            name: u.name,
            username: u.username,
            role: u.role,
            avatar: u.profile?.logoUrl || null,
            clubName: u.profile?.clubName || null,
        }));

        return res.json(results);
    } catch (error) {
        console.error('searchUsers error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
