import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import {
    Plus, Search, ShoppingCart, ArrowLeft, Store, Clock,
    Phone, MapPin, Zap, Package, AlertTriangle
} from 'lucide-react';

const API = 'http://localhost:5000/api';

const PharmacyView = () => {
    const { id } = useParams();
    const [medicines, setMedicines] = useState([]);
    const [pharmacy, setPharmacy] = useState(null);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [addedIds, setAddedIds] = useState({});
    const { addToCart, cart } = useCart();

    const fetchPharmacy = useCallback(async () => {
        try {
            const res = await axios.get(`${API}/pharmacy`);
            const found = res.data.find(p => p._id === id);
            setPharmacy(found || null);
        } catch { /* ignore */ }
    }, [id]);

    const fetchMedicines = useCallback(async (q = '') => {
        try {
            setLoading(true);
            const res = await axios.get(
                `${API}/pharmacy/${id}/medicines${q ? `?search=${encodeURIComponent(q)}` : ''}`
            );
            setMedicines(res.data);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, [id]);

    useEffect(() => {
        fetchPharmacy();
        fetchMedicines();
    }, [fetchPharmacy, fetchMedicines]);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => fetchMedicines(search), 350);
        return () => clearTimeout(t);
    }, [search, fetchMedicines]);

    const handleAddToCart = (med) => {
        addToCart({ ...med, pharmacyId: id });
        setAddedIds(prev => ({ ...prev, [med._id]: true }));
        setTimeout(() => setAddedIds(prev => ({ ...prev, [med._id]: false })), 1500);
    };

    const cartCount = cart.reduce((acc, i) => acc + i.quantity, 0);

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.06) 100%)',
                borderBottom: '1px solid var(--color-border)',
                padding: '28px 32px',
                marginBottom: '32px',
            }}>
                <Link to="/customer/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)', fontSize: '13px', textDecoration: 'none', marginBottom: '18px' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
                >
                    <ArrowLeft size={14} /> Back to Pharmacies
                </Link>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '14px',
                                background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Store size={22} color="var(--color-primary-light)" />
                            </div>
                            <div>
                                <h1 style={{ fontSize: '22px', fontWeight: 800 }}>
                                    {pharmacy?.pharmacyName || 'Pharmacy'}
                                </h1>
                                {pharmacy && (
                                    <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                                        {pharmacy.address && (
                                            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <MapPin size={10} /> {pharmacy.address}
                                            </span>
                                        )}
                                        {pharmacy.contactNumber && (
                                            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Phone size={10} /> {pharmacy.contactNumber}
                                            </span>
                                        )}
                                        {pharmacy.operatingHours && (
                                            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={10} /> {pharmacy.operatingHours}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Cart button */}
                    <Link to="/cart" style={{ textDecoration: 'none' }}>
                        <button className="btn btn-primary" style={{ position: 'relative' }}>
                            <ShoppingCart size={16} />
                            Cart
                            {cartCount > 0 && (
                                <span style={{
                                    position: 'absolute', top: '-8px', right: '-8px',
                                    background: 'var(--color-emergency)', color: '#fff',
                                    borderRadius: '100px', fontSize: '11px', fontWeight: 700,
                                    minWidth: '20px', height: '20px', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', padding: '0 4px',
                                }}>
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </Link>
                </div>

                {/* Search */}
                <div className="search-wrapper" style={{ marginTop: '20px', maxWidth: '440px' }}>
                    <Search size={15} className="search-icon" />
                    <input
                        className="input-dark search-input"
                        placeholder="Search medicines in this pharmacy…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div style={{ padding: '0 32px' }}>
                {/* Emergency delivery notice */}
                <div style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 18px',
                    marginBottom: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                }}>
                    <div style={{ color: 'var(--color-emergency)', flexShrink: 0 }}>
                        <Zap size={20} />
                    </div>
                    <div>
                        <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-emergency-light)', marginBottom: '2px' }}>
                            Emergency Delivery Available
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                            Need medicines urgently? Add items to cart and enable Emergency Delivery at checkout for ₹50 extra — prioritised, faster delivery.
                        </p>
                    </div>
                </div>

                {/* Medicine Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-dim)' }}>Loading medicines…</div>
                ) : medicines.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-dim)' }}>
                        <Package size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
                        <p>No medicines found{search ? ` for "${search}"` : ''}</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '18px' }}>
                        {medicines.map((med, i) => {
                            const isAdded = addedIds[med._id];
                            const outOfStock = med.stock === 0;
                            return (
                                <div key={med._id}
                                    className="glass-card animate-slide-up"
                                    style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', animationDelay: `${i * 40}ms` }}
                                >
                                    {med.image && (
                                        <img src={med.image} alt={med.name}
                                            style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '14px' }}
                                        />
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                            <h3 style={{ fontWeight: 700, fontSize: '15px' }}>{med.name}</h3>
                                            {med.category && (
                                                <span style={{ fontSize: '10px', background: 'rgba(99,102,241,0.15)', color: 'var(--color-primary-light)', padding: '2px 8px', borderRadius: '100px', border: '1px solid rgba(99,102,241,0.2)', flexShrink: 0, marginLeft: '6px' }}>
                                                    {med.category}
                                                </span>
                                            )}
                                        </div>
                                        {med.description && (
                                            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '10px', lineHeight: 1.5 }}>
                                                {med.description}
                                            </p>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                            <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary-light)' }}>₹{med.price}</span>
                                            <span style={{
                                                fontSize: '11px', fontWeight: 600,
                                                color: outOfStock ? 'var(--color-emergency)' : 'var(--color-success)',
                                            }}>
                                                {outOfStock ? 'Out of Stock' : `${med.stock} left`}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAddToCart(med)}
                                        disabled={outOfStock}
                                        className={`btn btn-full ${isAdded ? 'btn-success' : 'btn-primary'}`}
                                        style={{ transition: 'all 0.3s' }}
                                    >
                                        {isAdded ? (
                                            <><ShoppingCart size={14} /> Added!</>
                                        ) : (
                                            <><Plus size={14} /> Add to Cart</>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PharmacyView;
