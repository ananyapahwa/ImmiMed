import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, MapPin, Navigation, Store, Clock, Star, X, Pill } from 'lucide-react';

const API = 'http://localhost:5000/api';

const CustomerDashboard = () => {
    const [pharmacies, setPharmacies] = useState([]);
    const [search, setSearch] = useState('');
    const [medSearch, setMedSearch] = useState('');
    const [medResults, setMedResults] = useState([]);
    const [medLoading, setMedLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [nearbyMode, setNearbyMode] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('pharmacies'); // 'pharmacies' | 'medicines'

    const fetchPharmacies = useCallback(async (q = '') => {
        try {
            setLoading(true);
            const res = await axios.get(`${API}/pharmacy${q ? `?search=${encodeURIComponent(q)}` : ''}`);
            setPharmacies(res.data);
        } catch {
            setError('Failed to load pharmacies');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPharmacies();
    }, [fetchPharmacies]);

    // Debounce pharmacy search
    useEffect(() => {
        const t = setTimeout(() => {
            if (!nearbyMode) fetchPharmacies(search);
        }, 350);
        return () => clearTimeout(t);
    }, [search, nearbyMode, fetchPharmacies]);

    // Debounce global medicine search
    useEffect(() => {
        if (!medSearch.trim()) { setMedResults([]); return; }
        const t = setTimeout(async () => {
            setMedLoading(true);
            try {
                const res = await axios.get(`${API}/pharmacy/search-medicines?query=${encodeURIComponent(medSearch)}`);
                setMedResults(res.data);
            } catch { /* ignore */ }
            finally { setMedLoading(false); }
        }, 400);
        return () => clearTimeout(t);
    }, [medSearch]);

    const handleNearMe = () => {
        setLoading(true);
        setError(null);
        if (!navigator.geolocation) {
            setError('Geolocation not supported');
            setLoading(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                try {
                    const res = await axios.get(`${API}/pharmacy/nearby?lat=${coords.latitude}&lng=${coords.longitude}`);
                    setPharmacies(res.data);
                    setNearbyMode(true);
                } catch {
                    setError('Failed to fetch nearby pharmacies');
                } finally {
                    setLoading(false);
                }
            },
            () => { setError('Unable to retrieve location'); setLoading(false); }
        );
    };

    const clearNearby = () => {
        setNearbyMode(false);
        setSearch('');
        fetchPharmacies();
    };

    const getBadgeClass = (status) => {
        const map = { pending: 'badge-pending', confirmed: 'badge-confirmed', ready_for_pickup: 'badge-ready', delivered: 'badge-delivered', cancelled: 'badge-cancelled' };
        return `badge ${map[status] || 'badge-pending'}`;
    };

    return (
        <div style={{ minHeight: '100vh', padding: '0 0 60px' }}>
            {/* Hero */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 50%, transparent 100%)',
                borderBottom: '1px solid var(--color-border)',
                padding: '40px 32px 32px',
                marginBottom: '32px',
            }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '6px' }}>
                    Find Your Medicine 💊
                </h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                    Browse nearby pharmacies or search medicines directly
                </p>

                {/* Tab bar */}
                <div className="tab-bar" style={{ maxWidth: '360px', marginBottom: '20px' }}>
                    <button
                        className={`tab-item${activeTab === 'pharmacies' ? ' active' : ''}`}
                        onClick={() => setActiveTab('pharmacies')}
                    >
                        <Store size={14} /> Pharmacies
                    </button>
                    <button
                        className={`tab-item${activeTab === 'medicines' ? ' active' : ''}`}
                        onClick={() => setActiveTab('medicines')}
                    >
                        <Pill size={14} /> Search Medicines
                    </button>
                </div>

                {activeTab === 'pharmacies' ? (
                    <div style={{ display: 'flex', gap: '10px', maxWidth: '600px', flexWrap: 'wrap' }}>
                        <div className="search-wrapper" style={{ flex: 1, minWidth: '220px' }}>
                            <Search size={15} className="search-icon" />
                            <input
                                className="input-dark search-input"
                                placeholder="Search pharmacies by name..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                disabled={nearbyMode}
                            />
                        </div>
                        {nearbyMode ? (
                            <button className="btn btn-ghost" onClick={clearNearby}>
                                <X size={14} /> Clear
                            </button>
                        ) : (
                            <button className="btn btn-primary" onClick={handleNearMe} disabled={loading}>
                                <Navigation size={14} />
                                {loading ? 'Locating…' : 'Near Me'}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="search-wrapper" style={{ maxWidth: '500px' }}>
                        <Search size={15} className="search-icon" />
                        <input
                            className="input-dark search-input"
                            placeholder="Search medicine name across all pharmacies…"
                            value={medSearch}
                            onChange={e => setMedSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                )}
            </div>

            <div style={{ padding: '0 32px' }}>
                {error && (
                    <div style={{ color: 'var(--color-emergency-light)', background: 'var(--color-emergency-glow)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: '20px', fontSize: '13px' }}>
                        {error}
                    </div>
                )}

                {/* Nearby pill */}
                {nearbyMode && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                        <span style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#86efac', borderRadius: '100px', padding: '4px 12px', fontSize: '12px', fontWeight: 600 }}>
                            <MapPin size={11} style={{ display: 'inline', marginRight: '4px' }} />
                            Showing pharmacies near you
                        </span>
                    </div>
                )}

                {/* Pharmacy Grid */}
                {activeTab === 'pharmacies' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {pharmacies.map((pharmacy, i) => (
                            <Link
                                to={`/pharmacy/${pharmacy._id}`}
                                key={pharmacy._id}
                                style={{ textDecoration: 'none', display: 'block', animationDelay: `${i * 50}ms` }}
                                className="animate-slide-up"
                            >
                                <div className="glass-card" style={{
                                    padding: '22px',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer',
                                }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                        e.currentTarget.style.boxShadow = 'var(--shadow-primary)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = 'var(--color-glass-border)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                                        <div style={{
                                            width: '44px', height: '44px', borderRadius: '12px',
                                            background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <Store size={20} color="var(--color-primary-light)" />
                                        </div>
                                        {pharmacy.location?.coordinates?.length > 0 && (
                                            <span style={{ fontSize: '10px', background: 'rgba(34,197,94,0.15)', color: '#86efac', padding: '3px 8px', borderRadius: '100px', border: '1px solid rgba(34,197,94,0.3)', fontWeight: 600 }}>
                                                📍 Verified
                                            </span>
                                        )}
                                    </div>
                                    <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', color: 'var(--color-text)' }}>
                                        {pharmacy.pharmacyName}
                                    </h2>
                                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                                        📍 {pharmacy.address}
                                    </p>
                                    <p style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>
                                        📞 {pharmacy.contactNumber}
                                    </p>
                                    {pharmacy.operatingHours && (
                                        <p style={{ fontSize: '11px', color: 'var(--color-text-dim)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={10} /> {pharmacy.operatingHours}
                                        </p>
                                    )}
                                    <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        {pharmacy.rating > 0 ? (
                                            <span style={{ fontSize: '12px', color: '#fcd34d', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Star size={11} fill="#fcd34d" /> {pharmacy.rating.toFixed(1)}
                                            </span>
                                        ) : <span />}
                                        <span style={{ fontSize: '12px', color: 'var(--color-primary-light)', fontWeight: 600 }}>
                                            View Medicines →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                        {pharmacies.length === 0 && !loading && (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: 'var(--color-text-dim)' }}>
                                <Store size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
                                <p>No pharmacies found</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Global Medicine Search Results */}
                {activeTab === 'medicines' && (
                    <div>
                        {medLoading && (
                            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '40px' }}>Searching…</p>
                        )}
                        {!medLoading && medSearch && medResults.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-dim)' }}>
                                <Pill size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
                                <p>No medicines found for "{medSearch}"</p>
                            </div>
                        )}
                        {!medLoading && !medSearch && (
                            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-dim)' }}>
                                <Search size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
                                <p>Type a medicine name to search across all pharmacies</p>
                            </div>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                            {medResults.map(med => (
                                <Link to={`/pharmacy/${med.pharmacyId}`} key={med._id} style={{ textDecoration: 'none' }}>
                                    <div className="glass-card" style={{ padding: '18px', transition: 'all 0.2s' }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-glass-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <h3 style={{ fontWeight: 700, fontSize: '15px' }}>{med.name}</h3>
                                            <span style={{ fontWeight: 700, color: 'var(--color-primary-light)' }}>₹{med.price}</span>
                                        </div>
                                        {med.description && <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '10px' }}>{med.description}</p>}
                                        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '10px', fontSize: '12px', color: 'var(--color-text-dim)' }}>
                                            <Store size={11} style={{ display: 'inline', marginRight: '4px' }} />
                                            {med.pharmacy?.pharmacyName || 'Unknown Pharmacy'}
                                            <span style={{ marginLeft: '8px', color: med.stock > 0 ? 'var(--color-success)' : 'var(--color-emergency)', fontWeight: 600 }}>
                                                {med.stock > 0 ? `In Stock (${med.stock})` : 'Out of Stock'}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerDashboard;
