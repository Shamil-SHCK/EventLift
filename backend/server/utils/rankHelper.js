import Event from '../models/Event.js';

export const calculateClubScore = async (profile) => {
    if (!profile) return { score: 0, tier: 'Bronze', stats: { totalRaised: 0, eventCount: 0, consistentMonths: 0, achievementCount: 0 } };

    const events = profile._id
        ? await Event.find({ organizer: profile._id })
        : [];

    const MAX_RAISED_LOG = Math.log(500_000 + 1);

    // 1. Sponsorship score (40 pts)
    const totalRaised = events.reduce((sum, e) => sum + (e.raised || 0), 0);
    const sponsorshipScore = totalRaised > 0
        ? Math.min(40, (Math.log(totalRaised + 1) / MAX_RAISED_LOG) * 40)
        : 0;

    // 2. Events count score (25 pts)
    const eventCount = events.length;
    const eventsScore = Math.min(25, (eventCount / 20) * 25);

    // 3. Consistency score (20 pts)
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
        score,
        tier,
        stats: {
            totalRaised,
            eventCount,
            consistentMonths: months.size,
            achievementCount,
        }
    };
};
