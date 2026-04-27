import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Pill, User, Mail, Lock, Phone, MapPin, Store, Truck, ArrowRight, Navigation } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'customer',
        pharmacyDetails: {
            pharmacyName: '',
            address: '',
            contactNumber: '',
        }
    });
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationSet, setLocationSet] = useState(false);
    const [latLng, setLatLng] = useState({ lat: null, lng: null });
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('pharmacy.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                pharmacyDetails: { ...prev.pharmacyDetails, [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const captureLocation = () => {
        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                setLatLng({ lat: coords.latitude, lng: coords.longitude });
                setLocationSet(true);
                setLocationLoading(false);
            },
            () => {
                alert('Could not get location');
                setLocationLoading(false);
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const payload = { ...formData };
        if (formData.role === 'pharmacy' && latLng.lat) {
            payload.pharmacyDetails = { ...payload.pharmacyDetails, lat: latLng.lat, lng: latLng.lng };
        }
        const res = await register(payload);
        setLoading(false);
        if (res.success) {
            navigate('/login');
        } else {
            setError(res.message || 'Registration failed');
        }
    };

    const roles = [
        { value: 'customer', label: 'Customer', icon: <User size={18} />, desc: 'Browse & order medicines' },
        { value: 'pharmacy', label: 'Pharmacy', icon: <Store size={18} />, desc: 'List & manage medicines' },
        { value: 'delivery', label: 'Delivery', icon: <Truck size={18} />, desc: 'Deliver orders' },
    ];

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 24px',
            background: 'radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.1) 0%, transparent 60%)',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '480px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '40px',
                backdropFilter: 'blur(16px)',
            }} className="animate-slide-up">

                {/* Logo */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '52px', height: '52px', borderRadius: '16px',
                        background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '14px', boxShadow: '0 0 24px rgba(99,102,241,0.4)',
                    }}>
                        <Pill size={24} color="#fff" />
                    </div>
                    <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>Create Account</h2>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Join IMMIMED today</p>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px', fontSize: '13px', color: 'var(--color-emergency-light)' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</label>
                        <div className="search-wrapper">
                            <User size={14} className="search-icon" />
                            <input name="name" className="input-dark search-input" placeholder="Your name" onChange={handleChange} required />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</label>
                        <div className="search-wrapper">
                            <Mail size={14} className="search-icon" />
                            <input type="email" name="email" className="input-dark search-input" placeholder="you@example.com" onChange={handleChange} required />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
                        <div className="search-wrapper">
                            <Lock size={14} className="search-icon" />
                            <input type="password" name="password" className="input-dark search-input" placeholder="••••••••" onChange={handleChange} required />
                        </div>
                    </div>

                    {/* Role selection */}
                    <div>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>I am a…</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {roles.map(r => (
                                <button
                                    key={r.value}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, role: r.value }))}
                                    style={{
                                        flex: 1,
                                        padding: '10px 8px',
                                        borderRadius: '10px',
                                        border: formData.role === r.value ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                                        background: formData.role === r.value ? 'rgba(99,102,241,0.15)' : 'var(--color-surface)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '4px',
                                        transition: 'all 0.2s',
                                        color: formData.role === r.value ? 'var(--color-primary-light)' : 'var(--color-text-muted)',
                                    }}
                                >
                                    {r.icon}
                                    <span style={{ fontSize: '11px', fontWeight: 700 }}>{r.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pharmacy details */}
                    {formData.role === 'pharmacy' && (
                        <div style={{
                            background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)',
                            borderRadius: '12px', padding: '16px',
                            display: 'flex', flexDirection: 'column', gap: '10px',
                        }}>
                            <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary-light)', marginBottom: '4px' }}>
                                🏥 Pharmacy Details
                            </p>
                            <div className="search-wrapper">
                                <Store size={14} className="search-icon" />
                                <input placeholder="Pharmacy Name" name="pharmacy.pharmacyName" className="input-dark search-input" onChange={handleChange} required />
                            </div>
                            <div className="search-wrapper">
                                <MapPin size={14} className="search-icon" />
                                <input placeholder="Full Address" name="pharmacy.address" className="input-dark search-input" onChange={handleChange} required />
                            </div>
                            <div className="search-wrapper">
                                <Phone size={14} className="search-icon" />
                                <input placeholder="Contact Number" name="pharmacy.contactNumber" className="input-dark search-input" onChange={handleChange} required />
                            </div>
                            <button
                                type="button"
                                onClick={captureLocation}
                                disabled={locationLoading}
                                className="btn btn-ghost btn-sm"
                                style={{ justifyContent: 'flex-start', gap: '8px' }}
                            >
                                <Navigation size={13} />
                                {locationLoading ? 'Getting location…' : locationSet ? `📍 Location captured (${latLng.lat?.toFixed(4)}, ${latLng.lng?.toFixed(4)})` : 'Capture My Location (for nearby search)'}
                            </button>
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ marginTop: '8px', padding: '12px', fontSize: '15px' }}>
                        {loading ? 'Creating account…' : <>Create Account <ArrowRight size={16} /></>}
                    </button>
                </form>

                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--color-border)', textAlign: 'center', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--color-primary-light)', fontWeight: 600, textDecoration: 'none' }}>
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
