import { useState, useEffect } from 'react';
import { getCurrentUser, logoutUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getCurrentUser();
                setUser(userData);
            } catch (err) {
                console.error('Failed to fetch user', err);
                // If fetch fails (likely token invalid), logout and redirect
                logoutUser();
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [navigate]);

    const handleLogout = () => {
        logoutUser();
        setUser(null); // Clear local user state
        navigate('/login');
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>Loading dashboard...</div>
            </div>
        );
    }

    if (user?.verificationStatus === 'pending') {
        return (
            <div style={styles.container}>
                <div style={styles.pendingContainer}>
                    <h2 style={styles.pendingHeading}>Application Under Review</h2>
                    <p style={styles.pendingText}>
                        Welcome, {user.name}! Your {user.role} account has been created successfully.
                    </p>
                    <p style={styles.pendingSubText}>
                        You cannot post events or gigs until an Administrator verifies your credentials.
                        Please check back later.
                    </p>
                    <button
                        onClick={handleLogout}
                        style={styles.pendingButton}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#a16207'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#ca8a04'}
                    >
                        Logout
                    </button>
                </div>
            </div>
        );
    }

    if (user?.verificationStatus === 'rejected') {
        return (
            <div style={styles.container}>
                <div style={styles.rejectedContainer}>
                    <h2 style={styles.rejectedHeading}>Application Rejected</h2>
                    <p style={styles.rejectedText}>
                        Your application was reviewed and declined. Please contact support for details.
                    </p>
                    <button
                        onClick={handleLogout}
                        style={styles.rejectedButton}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
                    >
                        Logout
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <nav style={styles.navbar}>
                <h1 style={styles.logo}>Sponsorship Platform</h1>
                <div style={styles.navLinks}>
                    <button onClick={() => navigate('/profile')} style={styles.profileButton}>
                        Edit Profile
                    </button>
                    <button onClick={handleLogout} style={styles.logoutButton}>
                        Logout
                    </button>
                </div>
            </nav>

            <div style={styles.content}>
                <div style={styles.welcomeCard}>
                    <h2 style={styles.greeting}>Welcome, {user?.name}!</h2>
                    <div style={styles.userInfo}>
                        <p><strong>Email:</strong> {user?.email}</p>
                        <p><strong>Role:</strong> <span style={styles.roleTag}>{user?.role}</span></p>
                        <p><strong>Status:</strong> <span style={{
                            ...styles.statusTag,
                            backgroundColor: user?.verificationStatus === 'verified' ? '#e8f5e9' : '#fff3e0',
                            color: user?.verificationStatus === 'verified' ? '#2e7d32' : '#ef6c00'
                        }}>{user?.verificationStatus}</span></p>
                        {user?.clubName && <p><strong>Club:</strong> {user.clubName}</p>}
                        {user?.organizationName && <p><strong>Organization:</strong> {user.organizationName}</p>}
                    </div>
                </div>

                <div style={styles.dashboardGrid}>
                    {/* Placeholder for future dashboard widgets */}
                    <div style={styles.widget}>
                        <h3>Quick Actions</h3>
                        <p>Coming soon...</p>
                    </div>
                    <div style={styles.widget}>
                        <h3>Recent Activity</h3>
                        <p>No recent activity.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        display: 'flex',
        flexDirection: 'column',
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666',
    },
    navbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        flexWrap: 'wrap',
    },
    logo: {
        margin: 0,
        color: '#2196F3',
        fontSize: '1.5rem',
        flexShrink: 0,
    },
    navLinks: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    profileButton: {
        padding: '0.5rem 1rem',
        backgroundColor: '#e2e8f0',
        color: '#475569',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: 'bold',
    },
    logoutButton: {
        padding: '0.5rem 1rem',
        backgroundColor: '#f44336',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        marginTop: '0.5rem', // Spacing for mobile wrap
    },
    content: {
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
    },
    welcomeCard: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '2rem',
    },
    greeting: {
        marginTop: 0,
        color: '#333',
        fontSize: 'clamp(1.5rem, 5vw, 2rem)', // Responsive font size
    },
    userInfo: {
        marginTop: '1rem',
        lineHeight: '1.6',
        color: '#555',
    },
    roleTag: {
        backgroundColor: '#e3f2fd',
        color: '#1976d2',
        padding: '0.2rem 0.5rem',
        borderRadius: '12px',
        fontSize: '0.85rem',
        textTransform: 'capitalize',
        whiteSpace: 'nowrap',
    },
    statusTag: {
        padding: '0.2rem 0.5rem',
        borderRadius: '12px',
        fontSize: '0.85rem',
        marginLeft: '0.5rem',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
    },
    dashboardGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', // Auto-responsive grid
        gap: '1.5rem',
    },
    widget: {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        minWidth: '0', // Prevents overflow in flex/grid items
    },
    pendingContainer: {
        padding: '2rem',
        maxWidth: '42rem',
        margin: '5rem auto 0',
        textAlign: 'center',
        backgroundColor: '#fefce8',
        border: '1px solid #fef08a',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    pendingHeading: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#854d0e',
        marginBottom: '1rem',
    },
    pendingText: {
        color: '#374151',
        marginBottom: '1rem',
    },
    pendingSubText: {
        color: '#4b5563',
        marginBottom: '1.5rem',
    },
    pendingButton: {
        padding: '0.5rem 1rem',
        backgroundColor: '#ca8a04',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        fontWeight: 'bold',
    },
    rejectedContainer: {
        padding: '2rem',
        maxWidth: '42rem',
        margin: '5rem auto 0',
        textAlign: 'center',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    rejectedHeading: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#991b1b',
        marginBottom: '1rem',
    },
    rejectedText: {
        color: '#374151',
        marginBottom: '1.5rem',
    },
    rejectedButton: {
        padding: '0.5rem 1rem',
        backgroundColor: '#dc2626',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.2s',
    },
};

export default Dashboard;
