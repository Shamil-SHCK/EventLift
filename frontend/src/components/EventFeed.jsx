import ClubEventFeed from './ClubEventFeed';
import CompanyEventFeed from './CompanyEventFeed';
import AlumniEventFeed from './AlumniEventFeed';

const EventFeed = ({ userType, onSponsorshipSuccess, filterMode }) => {
    const normalizedType = userType ? userType.toLowerCase() : '';

    if (normalizedType === 'club-admin') {
        return <ClubEventFeed />;
    }

    if (normalizedType === 'company') {
        return <CompanyEventFeed onSponsorshipSuccess={onSponsorshipSuccess} />;
    }

    if (normalizedType === 'alumni' || normalizedType === 'alumni-individual') {
        return <AlumniEventFeed onSponsorshipSuccess={onSponsorshipSuccess} filterMode={filterMode} />;
    }

    // Default fallback (Read Only) for guests or unknown roles
    return <ClubEventFeed />;
};

export default EventFeed;
