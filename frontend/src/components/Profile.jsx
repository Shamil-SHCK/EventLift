import { useState, useEffect } from 'react';
import { getCurrentUser, updateUserProfile, changeUserPassword } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        clubName: '',
        organizationName: '',
        formerInstitution: '',
        phone: '',
        logoUrl: '',
        description: '',
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getCurrentUser();
                setUser(userData);
                setFormData({
                    clubName: userData.clubName || '',
                    organizationName: userData.organizationName || '',
                    formerInstitution: userData.formerInstitution || '',
                    phone: userData.phone || '',
                    logoUrl: userData.logoUrl || '',
                    description: userData.description || '',
                });
            } catch (err) {
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        setError('');

        try {
            await updateUserProfile(formData);
            setMessage('Profile updated successfully!');
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            setError('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            await changeUserPassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setMessage('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (err) {
            setError(err.message || 'Failed to change password');
        }
    };

    if (loading) return <div style={styles.loading}>Loading profile...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Edit Profile</h2>
                    <button onClick={() => navigate('/dashboard')} style={styles.backButton}>Back to Dashboard</button>
                </div>

                {message && <div style={styles.success}>{message}</div>}
                {error && <div style={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    {user.role === 'club-admin' && (
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Club Name</label>
                            <input
                                type="text"
                                name="clubName"
                                value={formData.clubName}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </div>
                    )}

                    {user.role === 'company' && (
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Organization Name</label>
                            <input
                                type="text"
                                name="organizationName"
                                value={formData.organizationName}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </div>
                    )}

                    {user.role === 'alumni-individual' && (
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Former Institution</label>
                            <input
                                type="text"
                                name="formerInstitution"
                                value={formData.formerInstitution}
                                onChange={handleChange}
                                style={styles.input}
                            />
                        </div>
                    )}

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Phone Number</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="+1 234 567 8900"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Logo URL / Avatar</label>
                        <input
                            type="text"
                            name="logoUrl"
                            value={formData.logoUrl}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="https://example.com/logo.png"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Description / Bio</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            style={{ ...styles.input, minHeight: '100px' }}
                            placeholder="Tell us about yourself..."
                        />
                    </div>

                    <button type="submit" disabled={saving} style={styles.saveButton}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>

                <hr style={styles.divider} />

                <h3 style={styles.sectionTitle}>Change Password</h3>
                <form onSubmit={handlePasswordSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Current Password</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            style={styles.input}
                            required
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            style={styles.input}
                            required
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmNewPassword"
                            value={passwordData.confirmNewPassword}
                            onChange={handlePasswordChange}
                            style={styles.input}
                            required
                        />
                    </div>
                    <button type="submit" style={styles.secondaryButton}>
                        Update Password
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        padding: '2rem',
        display: 'flex',
        justifyContent: 'center',
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: '#64748b',
    },
    card: {
        backgroundColor: 'white',
        padding: '2.5rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        width: '100%',
        maxWidth: '600px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#1e293b',
        margin: 0,
    },
    backButton: {
        padding: '0.5rem 1rem',
        backgroundColor: '#e2e8f0',
        color: '#475569',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: '600',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    label: {
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#475569',
    },
    input: {
        padding: '0.75rem',
        borderRadius: '6px',
        border: '1px solid #cbd5e1',
        fontSize: '1rem',
        color: '#1e293b',
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    saveButton: {
        padding: '0.75rem',
        backgroundColor: '#2563eb',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '1rem',
        transition: 'background-color 0.2s',
    },
    success: {
        padding: '1rem',
        backgroundColor: '#dcfce7',
        color: '#166534',
        borderRadius: '6px',
        marginBottom: '1.5rem',
    },
    error: {
        padding: '1rem',
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        borderRadius: '6px',
        marginBottom: '1.5rem',
    },
    divider: {
        margin: '2rem 0',
        border: 'none',
        borderTop: '1px solid #e2e8f0',
    },
    sectionTitle: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: '1rem',
    },
    secondaryButton: {
        padding: '0.75rem',
        backgroundColor: '#475569',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '1rem',
        transition: 'background-color 0.2s',
    },
};

export default Profile;
