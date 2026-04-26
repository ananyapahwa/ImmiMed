import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Pill, Mail, Lock, ArrowRight } from 'lucide-react';

const cardStyle = {
    width: '100%',
    maxWidth: '420px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '40px',
    backdropFilter: 'blur(16px)',
};

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const res = await login(email, password);
        setLoading(false);
        if (res.success) {
            navigate('/');
        } else {
            setError(res.message || 'Login failed');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: 'radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(139,92,246,0.08) 0%, transparent 60%)',
        }}>
            <div style={cardStyle} className="animate-slide-up">
                {/* Logo */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '36px' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '16px',
                        boxShadow: '0 0 24px rgba(99,102,241,0.4)',
                    }}>
                        <Pill size={26} color="#fff" />
                    </div>
                    <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>Welcome back</h2>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Sign in to your PharmaPlatform account</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '8px', padding: '10px 14px', marginBottom: '20px',
                        fontSize: '13px', color: 'var(--color-emergency-light)',
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Email
                        </label>
                        <div className="search-wrapper">
                            <Mail size={14} className="search-icon" />
                            <input
                                id="login-email"
                                type="email"
                                className="input-dark search-input"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Password
                        </label>
                        <div className="search-wrapper">
                            <Lock size={14} className="search-icon" />
                            <input
                                id="login-password"
                                type="password"
                                className="input-dark search-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        id="login-submit"
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary btn-full"
                        style={{ marginTop: '8px', padding: '12px', fontSize: '15px' }}
                    >
                        {loading ? 'Signing in…' : <>Sign In <ArrowRight size={16} /></>}
                    </button>
                </form>

                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--color-border)', textAlign: 'center', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: 'var(--color-primary-light)', fontWeight: 600, textDecoration: 'none' }}>
                        Register
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
