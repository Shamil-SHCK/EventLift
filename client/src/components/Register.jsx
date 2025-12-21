import { useState } from 'react';
import { registerUser } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'club-admin',
        clubName: '',
        organizationName: '',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { name, email, password, confirmPassword, role, clubName, organizationName } = formData;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (role === 'club-admin' && !clubName) {
            setError('Club name is required for club registration');
            return;
        }

        if (role === 'company' && !organizationName) {
            setError('Organization name is required for company registration');
            return;
        }

        setLoading(true);

        try {
            const userData = {
                name,
                email,
                password,
                role,
            };

            if (role === 'club-admin') {
                userData.clubName = clubName;
            }

            if (role === 'company') {
                userData.organizationName = organizationName;
            }

            const data = await registerUser(userData);
            setSuccess('Registration successful! Redirecting...');

            // Redirect after successful registration
            setTimeout(() => {
                navigate('/login');
            }, 1000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formCard}>
                <h2 style={styles.title}>Register for Sponsorship Platform</h2>

                {error && <div style={styles.error}>{error}</div>}
                {success && <div style={styles.success}>{success}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={name}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="Enter your name"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="Enter your email"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="Enter password (min. 6 characters)"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={handleChange}
                            required
                            style={styles.input}
                            placeholder="Confirm your password"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Role</label>
                        <select
                            name="role"
                            value={role}
                            onChange={handleChange}
                            style={styles.select}
                        >
                            <option value="administrator">Administrator</option>
                            <option value="club-admin">Club Admin</option>
                            <option value="alumni-individual">Alumni / Individual Sponsor</option>
                            <option value="company">Company</option>
                        </select>
                    </div>

                    {role === 'club-admin' && (
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Club Name</label>
                            <input
                                type="text"
                                name="clubName"
                                value={clubName}
                                onChange={handleChange}
                                required
                                style={styles.input}
                                placeholder="Enter your club name"
                            />
                        </div>
                    )}

                    {role === 'company' && (
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Company/Organization Name</label>
                            <input
                                type="text"
                                name="organizationName"
                                value={organizationName}
                                onChange={handleChange}
                                required
                                style={styles.input}
                                placeholder="Enter your company name"
                            />
                        </div>
                    )}

                    <button type="submit" disabled={loading} style={styles.button}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <p style={styles.footer}>
                    Already have an account? <Link to="/login" style={styles.link}>Login</Link>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '15px', // Reduced padding for small screens
    },
    formCard: {
        backgroundColor: 'white',
        padding: '30px', // Adjusted padding
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '500px',
        boxSizing: 'border-box', // Ensure padding doesn't overflow width
    },
    title: {
        textAlign: 'center',
        marginBottom: '25px',
        color: '#333',
        fontSize: '1.5rem', // Responsive font size could be added here
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    formGroup: {
        marginBottom: '15px',
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold',
        color: '#555',
        fontSize: '0.9rem',
    },
    input: {
        width: '100%',
        padding: '12px', // Larger touch target
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '16px', // Prevent zoom on iOS
        boxSizing: 'border-box',
    },
    select: {
        width: '100%',
        padding: '12px', // Larger touch target
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '16px', // Prevent zoom on iOS
        boxSizing: 'border-box',
    },
    button: {
        padding: '14px', // Larger touch target
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '15px',
    },
    error: {
        padding: '10px',
        backgroundColor: '#f44336',
        color: 'white',
        borderRadius: '4px',
        marginBottom: '20px',
        fontSize: '0.9rem',
    },
    success: {
        padding: '10px',
        backgroundColor: '#4CAF50',
        color: 'white',
        borderRadius: '4px',
        marginBottom: '20px',
        fontSize: '0.9rem',
    },
    footer: {
        textAlign: 'center',
        marginTop: '20px',
        color: '#666',
        fontSize: '0.9rem',
    },
    link: {
        color: '#4CAF50',
        textDecoration: 'none',
        fontWeight: 'bold',
    },
};

export default Register;
