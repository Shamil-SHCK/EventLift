import { useState } from 'react';
import { loginUser } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { email, password } = formData;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const data = await loginUser({ email, password });
            setSuccess('Login successful! Redirecting...');

            // Redirect after successful login
            setTimeout(() => {
                if (data.role === 'administrator') {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
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
                <h2 style={styles.title}>Login to Sponsorship Platform</h2>

                {error && <div style={styles.error}>{error}</div>}
                {success && <div style={styles.success}>{success}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
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
                            placeholder="Enter your password"
                        />
                    </div>

                    <button type="submit" disabled={loading} style={styles.button}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p style={styles.footer}>
                    Don't have an account? <Link to="/register" style={styles.link}>Register</Link>
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
        backgroundColor: '#f8fafc', // Slate-50: Clean, light off-white
        padding: '15px',
    },
    formCard: {
        backgroundColor: 'white',
        padding: '2.5rem',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        width: '100%',
        maxWidth: '450px',
        boxSizing: 'border-box',
    },
    title: {
        textAlign: 'center',
        marginBottom: '25px',
        color: '#333',
        fontSize: '1.5rem',
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
    button: {
        padding: '14px', // Larger touch target
        backgroundColor: '#2196F3',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '10px',
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
        color: '#2196F3',
        textDecoration: 'none',
        fontWeight: 'bold',
    },
};

export default Login;
