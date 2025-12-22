import { useState, useEffect } from 'react';
import { getPendingUsers, getAllUsers, verifyUser, resetUserPassword, logoutUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState('pending'); // 'pending' | 'all'
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                let data;
                if (filter === 'pending') {
                    data = await getPendingUsers();
                } else {
                    data = await getAllUsers();
                }
                setUsers(data);
            } catch (err) {
                setError(err.message);
                if (err.message.includes('Not authorized')) {
                    logoutUser();
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [navigate, filter]);

    const handleVerify = async (userId, status) => {
        try {
            await verifyUser(userId, status);
            // If viewing pending, remove from list. If layout is 'all', maybe just update status? 
            // For simplicity, just refetch or update local state.
            if (filter === 'pending') {
                setUsers(users.filter((user) => user._id !== userId));
            } else {
                // Update the specific user in the list
                setUsers(users.map(u => u._id === userId ? { ...u, verificationStatus: status } : u));
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleResetPassword = async (userId) => {
        if (!window.confirm('Are you sure you want to reset this user\'s password to "ChangeMe@123"?')) {
            return;
        }
        try {
            await resetUserPassword(userId);
            alert('Password reset successfully to "ChangeMe@123"');
        } catch (err) {
            alert('Failed to reset password: ' + err.message);
        }
    };

    const handleLogout = () => {
        logoutUser();
        setUsers([]); // Clear displayed data
        navigate('/login');
    };

    if (loading) return <div style={styles.loading}>Loading...</div>;

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>Admin Verification Panel</h1>
                <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
            </header>

            <div style={styles.content}>
                {error && <div style={styles.error}>{error}</div>}

                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div style={styles.cardHeaderLeft}>
                            <h2 style={styles.cardTitle}>{filter === 'pending' ? 'Pending Applications' : 'All Users'}</h2>
                            <span style={styles.badge}>{users.length} {filter === 'pending' ? 'pending' : 'users'}</span>
                        </div>
                        <div style={styles.filterControls}>
                            <button
                                style={filter === 'pending' ? styles.filterBtnActive : styles.filterBtn}
                                onClick={() => setFilter('pending')}
                            >
                                Pending
                            </button>
                            <button
                                style={filter === 'all' ? styles.filterBtnActive : styles.filterBtn}
                                onClick={() => setFilter('all')}
                            >
                                All Users
                            </button>
                        </div>
                    </div>

                    {users.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyState}>
                                <p>No {filter === 'pending' ? 'pending' : ''} users found.</p>
                                <p style={styles.emptySubtext}>
                                    {filter === 'pending' ? 'New registrations will appear here.' : 'No users in the database.'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div style={styles.tableContainer}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Name</th>
                                        <th style={styles.th}>Email</th>
                                        <th style={styles.th}>Role</th>
                                        <th style={styles.th}>Affiliation</th>
                                        <th style={styles.th}>Document</th>
                                        <th style={styles.th}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user._id} style={styles.tr}>
                                            <td style={styles.td}>
                                                <div style={styles.userName}>{user.name}</div>
                                            </td>
                                            <td style={styles.td}>{user.email}</td>
                                            <td style={styles.td}>
                                                <span style={styles.roleTag}>{user.role}</span>
                                            </td>
                                            <td style={styles.td}>{user.clubName || user.organizationName || user.formerInstitution || 'N/A'}</td>
                                            <td style={styles.td}>
                                                {user.verificationDocument ? (
                                                    <a
                                                        href={`http://localhost:5000/${user.verificationDocument}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={styles.link}
                                                    >
                                                        View Doc
                                                    </a>
                                                ) : (
                                                    <span style={{ color: '#999' }}>N/A</span>
                                                )}
                                            </td>
                                            <td style={styles.td}>
                                                <div style={styles.actionButtons}>
                                                    {user.verificationStatus === 'pending' && (
                                                        <>
                                                            <button
                                                                style={styles.approveBtn}
                                                                onClick={() => handleVerify(user._id, 'verified')}
                                                                title="Approve User"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                style={styles.rejectBtn}
                                                                onClick={() => handleVerify(user._id, 'rejected')}
                                                                title="Reject User"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        style={styles.resetBtn}
                                                        onClick={() => handleResetPassword(user._id)}
                                                        title="Reset Password"
                                                    >
                                                        Reset PW
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: '"Inter", "Segoe UI", sans-serif',
    },
    header: {
        backgroundColor: 'white',
        padding: '1rem 2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        margin: 0,
        fontSize: '1.25rem',
        color: '#1e293b',
        fontWeight: '700',
    },
    logoutButton: {
        padding: '0.5rem 1rem',
        backgroundColor: '#f1f5f9',
        color: '#475569',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '600',
        transition: 'background-color 0.2s',
    },
    content: {
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        overflow: 'hidden',
    },
    cardHeader: {
        padding: '1.5rem',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    cardHeaderLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    filterControls: {
        display: 'flex',
        gap: '0.5rem',
        backgroundColor: '#f1f5f9',
        padding: '0.25rem',
        borderRadius: '8px',
    },
    filterBtn: {
        padding: '0.5rem 1rem',
        border: 'none',
        backgroundColor: 'transparent',
        color: '#64748b',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '600',
        transition: 'all 0.2s',
    },
    filterBtnActive: {
        padding: '0.5rem 1rem',
        border: 'none',
        backgroundColor: 'white',
        color: '#0f172a',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '600',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        transition: 'all 0.2s',
    },
    cardTitle: {
        margin: 0,
        fontSize: '1.1rem',
        color: '#334155',
        fontWeight: '600',
    },
    badge: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '700',
    },
    tableContainer: {
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left',
    },
    th: {
        padding: '1rem 1.5rem',
        backgroundColor: '#f8fafc',
        color: '#64748b',
        fontSize: '0.75rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: '1px solid #e2e8f0',
    },
    tr: {
        borderBottom: '1px solid #f1f5f9',
    },
    td: {
        padding: '1rem 1.5rem',
        color: '#334155',
        fontSize: '0.9rem',
    },
    userName: {
        fontWeight: '600',
        color: '#1e293b',
    },
    roleTag: {
        backgroundColor: '#e0f2fe',
        color: '#0369a1',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    actionButtons: {
        display: 'flex',
        gap: '0.75rem',
    },
    approveBtn: {
        padding: '0.5rem 1rem',
        backgroundColor: '#22c55e',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '500',
        transition: 'background-color 0.2s',
    },
    rejectBtn: {
        padding: '0.5rem 1rem',
        backgroundColor: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '500',
        transition: 'background-color 0.2s',
    },
    resetBtn: {
        padding: '0.5rem 1rem',
        backgroundColor: '#f59e0b', // Amber
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '500',
        transition: 'background-color 0.2s',
    },
    emptyState: {
        padding: '4rem 2rem',
        textAlign: 'center',
        color: '#64748b',
    },
    emptySubtext: {
        fontSize: '0.875rem',
        marginTop: '0.5rem',
        color: '#94a3b8',
    },
    error: {
        padding: '1rem',
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        border: '1px solid #fecaca',
    },
    loading: {
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#64748b',
    },
};

export default AdminPanel;
