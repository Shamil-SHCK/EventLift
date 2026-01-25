import User from '../models/User.js';
import Event from '../models/Event.js';
import Gig from '../models/Gig.js';
import ClubProfile from '../models/ClubProfile.js';
import CompanyProfile from '../models/CompanyProfile.js';
import AlumniProfile from '../models/AlumniProfile.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
    try {
        const user = req.user;
        let stats = {};

        if (user.role === 'club-admin') {
            const [clubProfile, acceptedGigs, completedGigs, myEvents] = await Promise.all([
                ClubProfile.findOne({ user: user._id }),
                Gig.countDocuments({ assignedClub: user._id, status: { $in: ['accepted', 'completed'] } }),
                Gig.countDocuments({ assignedClub: user._id, status: 'completed' }),
                Event.find({ organizer: user.profile || null }) // Using profile ID if available
            ]);

            const totalEvents = clubProfile ? clubProfile.events.length : 0;
            // Fallback for myEvents query if user.profile ID wasn't correct
            // Ideally we use the same logic as getMyEvents: Event.find({ organizer: profile._id })

            const totalRaised = myEvents.reduce((acc, event) => acc + (event.raised || 0), 0);

            stats = {
                title: 'Club Overview',
                cards: [
                    { label: 'Total Events', value: totalEvents, icon: 'Calendar' },
                    { label: 'Assigned Gigs', value: acceptedGigs, icon: 'Briefcase' },
                    { label: 'Completed Gigs', value: completedGigs, icon: 'CheckCircle' },
                    { label: 'Funds Raised', value: `₹${totalRaised}`, icon: 'DollarSign' }
                ]
            };
        } else if (user.role === 'company') {
            const [companyProfile, totalPostedGigs, activeGigs] = await Promise.all([
                CompanyProfile.findOne({ user: user._id }),
                Gig.countDocuments({ company: user.profile }), // Assuming company gig stores profile ID? Or user ID? Check Gig model. Usually it's profile.
                Gig.countDocuments({ company: user.profile, status: 'open' })
            ]);

            const sponsoredEvents = companyProfile && companyProfile.sponseredEvents ? companyProfile.sponseredEvents.length : 0;

            // Total invested
            let totalInvested = 0;
            if (companyProfile && companyProfile.sponseredEvents) {
                // We need to fetch the actual sponsorship amounts. 
                // The profile stores event IDs. The Event model stores sponsorship amounts.
                // This might be expensive if many events.
                // Alternative: Aggregate on Event collection where 'sponsors.sponsor' matches user profile id.
                const events = await Event.find({ 'sponsors.sponsor': user.profile });
                events.forEach(event => {
                    const sponsorRecord = event.sponsors.find(s => s.sponsor.toString() === user.profile.toString());
                    if (sponsorRecord) totalInvested += sponsorRecord.amount;
                });
            }


            stats = {
                title: 'Company Overview',
                cards: [
                    { label: 'Posted Gigs', value: totalPostedGigs, icon: 'Briefcase' },
                    { label: 'Active Gigs', value: activeGigs, icon: 'Activity' },
                    { label: 'Sponsored Events', value: sponsoredEvents, icon: 'Heart' },
                    { label: 'Total Invested', value: `₹${totalInvested}`, icon: 'DollarSign' }
                ]
            };
        } else if (user.role === 'alumni-individual') {
            const alumniProfile = await AlumniProfile.findOne({ user: user._id });
            const sponsoredEventsCount = alumniProfile ? alumniProfile.sponseredEvents.length : 0;
            let totalInvested = 0;
            if (alumniProfile) {
                const events = await Event.find({ 'sponsors.sponsor': user.profile });
                events.forEach(event => {
                    const sponsorRecord = event.sponsors.find(s => s.sponsor.toString() === user.profile.toString());
                    if (sponsorRecord) totalInvested += sponsorRecord.amount;
                });
            }

            stats = {
                title: 'Alumni Overview',
                cards: [
                    { label: 'Sponsored Events', value: sponsoredEventsCount, icon: 'Heart' },
                    { label: 'Total Contributed', value: `₹${totalInvested}`, icon: 'DollarSign' }
                ]
            };
        } else if (user.role === 'administrator') {
            const [totalUsers, totalEvents, totalGigs, totalRaisedAgg] = await Promise.all([
                User.countDocuments(),
                Event.countDocuments(),
                Gig.countDocuments(),
                Event.aggregate([{ $group: { _id: null, total: { $sum: '$raised' } } }])
            ]);

            const totalRaised = totalRaisedAgg[0]?.total || 0;

            stats = {
                title: 'Platform Overview',
                cards: [
                    { label: 'Total Users', value: totalUsers, icon: 'Users' },
                    { label: 'Total Events', value: totalEvents, icon: 'Calendar' },
                    { label: 'Total Gigs', value: totalGigs, icon: 'Briefcase' },
                    { label: 'Platform Volume', value: `₹${totalRaised}`, icon: 'BarChart' }
                ]
            };
        }

        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
