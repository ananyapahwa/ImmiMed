import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
    Plus, Package, Clock, AlertTriangle, Trash2,
    RefreshCw, CheckCircle2, Truck, Edit3, Store, Zap, X
} from 'lucide-react';

const API = 'http://localhost:5000/api';
const token = () => localStorage.getItem('token');
const headers = () => ({ 'x-auth-token': token() });

const CATEGORIES = ['Antibiotic', 'Painkiller', 'Vitamins', 'Antacid', 'Antiviral', 'Cardiovascular', 'Diabetes', 'Other'];

const statusBadge = (status, isEmergency) => {
    const classes = {
        pending: 'badge badge-pending',
        confirmed: 'badge badge-confirmed',
        ready_for_pickup: 'badge badge-ready',
        out_for_delivery: 'badge badge-confirmed',
        delivered: 'badge badge-delivered',
        cancelled: 'badge badge-cancelled',
    };
    return (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            {isEmergency && (
                <span className="badge badge-emergency urgent-blink">
                    🚨 EMERGENCY
                </span>
            )}
            <span className={classes[status] || 'badge badge-pending'}>
                {status.replace(/_/g, ' ')}
            </span>
        </div>
    );
};

const PharmacyDashboard = () => {
    const { user } = useAuth();
    const [tab, setTab] = useState('orders'); // 'orders' | 'emergency' | 'inventory'
    const [medicines, setMedicines] = useState([]);
    const [orders, setOrders] = useState([]);
    const [newMed, setNewMed] = useState({ name: '', price: '', stock: '', description: '', category: '' });
    const [refreshing, setRefreshing] = useState(false);
    const [profile, setProfile] = useState(null);

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setRefreshing(true);
        await Promise.all([fetchMedicines(), fetchOrders(), fetchProfile()]);
        setRefreshing(false);
    };

    const fetchMedicines = async () => {
        try {
            const res = await axios.get(`${API}/pharmacy/my-medicines`, { headers: headers() });
            setMedicines(res.data);
        } catch { /* ignore */ }
    };

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${API}/orders/pharmacy-orders`, { headers: headers() });
            setOrders(res.data);
        } catch { /* ignore */ }
    };

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`${API}/pharmacy/my-profile`, { headers: headers() });
            setProfile(res.data);
        } catch { /* ignore */ }
    };

    const handleAddMedicine = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API}/pharmacy/medicine`, newMed, { headers: headers() });
            setNewMed({ name: '', price: '', stock: '', description: '', category: '' });
            fetchMedicines();
        } catch {
            alert('Failed to add medicine');
        }
    };

    const deleteMedicine = async (id) => {
        if (!confirm('Delete this medicine?')) return;
        try {
            await axios.delete(`${API}/pharmacy/medicine/${id}`, { headers: headers() });
            fetchMedicines();
        } catch { alert('Failed to delete'); }
    };

    const updateStatus = async (orderId, status) => {
        try {
            await axios.put(`${API}/orders/${orderId}/status`, { status }, { headers: headers() });
            fetchOrders();
        } catch { /* ignore */ }
    };

    const setLocation = async () => {
        if (!navigator.geolocation) { alert('Geolocation not supported'); return; }
        navigator.geolocation.getCurrentPosition(async ({ coords }) => {
            try {
                await axios.put(`${API}/pharmacy/my-profile`, {
                    lat: coords.latitude, lng: coords.longitude
                }, { headers: headers() });
                fetchProfile();
                alert('Location updated!');
            } catch { alert('Failed to update location'); }
        }, () => alert('Could not get location'));
    };

    const emergencyOrders = orders.filter(o => o.isEmergency);
    const allOrders = orders;

    const statCards = [
        { label: 'Total Orders', value: allOrders.length, color: 'var(--color-primary-light)' },
        { label: 'Pending', value: allOrders.filter(o => o.status === 'pending').length, color: '#fcd34d' },
        { label: '🚨 Emergency', value: emergencyOrders.length, color: 'var(--color-emergency-light)' },
        { label: 'Medicines', value: medicines.length, color: 'var(--color-success)' },
    ];

    const renderOrderCard = (order) => (
        <div key={order._id}
            className={`order-card${order.isEmergency ? ' emergency-card' : ''} animate-slide-up`}
            style={{ ...(order.isEmergency && { boxShadow: '0 0 0 1px rgba(239,68,68,0.4), 0 4px 20px rgba(239,68,68,0.1)' }) }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{ fontWeight: 700, fontSize: '15px' }}>Order #{order._id.slice(-6).toUpperCase()}</h3>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        📍 {order.deliveryAddress}
                    </p>
                </div>
                {statusBadge(order.status, order.isEmergency)}
            </div>

            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                {order.items.map(i => `${i.name} ×${i.quantity}`).join(' · ')}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                    <span style={{ fontWeight: 800, fontSize: '16px', color: order.isEmergency ? 'var(--color-emergency-light)' : 'var(--color-primary-light)' }}>
                        ₹{order.totalAmount}
                    </span>
                    {order.isEmergency && (
                        <span style={{ fontSize: '11px', color: 'var(--color-text-dim)', marginLeft: '6px' }}>
                            (incl. ₹{order.emergencySurcharge} emergency fee)
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {order.status === 'pending' && (
                        <button className="btn btn-primary btn-sm" onClick={() => updateStatus(order._id, 'confirmed')}>
                            <CheckCircle2 size={13} /> Confirm
                        </button>
                    )}
                    {order.status === 'confirmed' && (
                        <button className="btn btn-success btn-sm" onClick={() => updateStatus(order._id, 'ready_for_pickup')}>
                            <Truck size={13} /> Ready for Pickup
                        </button>
                    )}
                    {order.status === 'cancelled' && (
                        <span style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>No action needed</span>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '60px' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, transparent 100%)',
                borderBottom: '1px solid var(--color-border)',
                padding: '28px 32px',
                marginBottom: '32px',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>
                            Pharmacy Dashboard
                        </h1>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                            {profile?.pharmacyName || user?.name || 'Your Pharmacy'}
                            {profile?.isApproved
                                ? <span style={{ marginLeft: '8px', color: 'var(--color-success)', fontSize: '11px' }}>● Approved</span>
                                : <span style={{ marginLeft: '8px', color: '#fcd34d', fontSize: '11px' }}>● Pending Approval</span>
                            }
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-ghost btn-sm" onClick={setLocation}>
                            📍 Set Location
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={fetchAll} disabled={refreshing}>
                            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                            {refreshing ? 'Refreshing…' : 'Refresh'}
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '24px' }}>
                    {statCards.map(s => (
                        <div key={s.label} className="stat-card">
                            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ padding: '0 32px' }}>
                {/* Tab bar */}
                <div className="tab-bar" style={{ maxWidth: '480px', marginBottom: '28px' }}>
                    <button className={`tab-item${tab === 'orders' ? ' active' : ''}`} onClick={() => setTab('orders')}>
                        <Clock size={14} /> All Orders
                        {allOrders.filter(o => o.status === 'pending').length > 0 && (
                            <span style={{ background: '#fcd34d', color: '#000', borderRadius: '100px', fontSize: '10px', fontWeight: 800, padding: '1px 6px' }}>
                                {allOrders.filter(o => o.status === 'pending').length}
                            </span>
                        )}
                    </button>
                    <button className={`tab-item emergency-tab${tab === 'emergency' ? ' active' : ''}`} onClick={() => setTab('emergency')}>
                        <Zap size={14} /> Emergency
                        {emergencyOrders.length > 0 && (
                            <span style={{ background: tab === 'emergency' ? 'rgba(255,255,255,0.3)' : 'var(--color-emergency)', color: '#fff', borderRadius: '100px', fontSize: '10px', fontWeight: 800, padding: '1px 6px' }}>
                                {emergencyOrders.length}
                            </span>
                        )}
                    </button>
                    <button className={`tab-item${tab === 'inventory' ? ' active' : ''}`} onClick={() => setTab('inventory')}>
                        <Package size={14} /> Inventory
                    </button>
                </div>

                {/* All Orders Tab */}
                {tab === 'orders' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {allOrders.length === 0
                            ? <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-dim)' }}><Clock size={36} style={{ opacity: 0.3, marginBottom: '12px' }} /><p>No orders yet</p></div>
                            : allOrders.map(renderOrderCard)
                        }
                    </div>
                )}

                {/* Emergency Tab */}
                {tab === 'emergency' && (
                    <div>
                        {emergencyOrders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-dim)' }}>
                                <Zap size={36} style={{ opacity: 0.3, marginBottom: '12px' }} />
                                <p>No emergency orders right now</p>
                                <p style={{ fontSize: '12px', marginTop: '6px' }}>Emergency orders will appear here with priority flagging</p>
                            </div>
                        ) : (
                            <div>
                                <div style={{
                                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
                                    borderRadius: 'var(--radius-md)', padding: '12px 18px', marginBottom: '20px',
                                    display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px',
                                    color: 'var(--color-emergency-light)',
                                }}>
                                    <AlertTriangle size={16} className="urgent-blink" />
                                    <span><strong>{emergencyOrders.length}</strong> emergency order{emergencyOrders.length !== 1 ? 's' : ''} require urgent attention. Prepare these first!</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    {emergencyOrders.map(renderOrderCard)}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Inventory Tab */}
                {tab === 'inventory' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
                        {/* Add Medicine Form */}
                        <div>
                            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Add Medicine</h2>
                            <form onSubmit={handleAddMedicine} className="glass-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <input className="input-dark" placeholder="Medicine name *" value={newMed.name} onChange={e => setNewMed({ ...newMed, name: e.target.value })} required />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <input className="input-dark" type="number" placeholder="Price (₹) *" value={newMed.price} onChange={e => setNewMed({ ...newMed, price: e.target.value })} required />
                                    <input className="input-dark" type="number" placeholder="Stock *" value={newMed.stock} onChange={e => setNewMed({ ...newMed, stock: e.target.value })} required />
                                </div>
                                <select className="input-dark" value={newMed.category} onChange={e => setNewMed({ ...newMed, category: e.target.value })}>
                                    <option value="">Category (optional)</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <input className="input-dark" placeholder="Description (optional)" value={newMed.description} onChange={e => setNewMed({ ...newMed, description: e.target.value })} />
                                <button type="submit" className="btn btn-primary" style={{ marginTop: '4px' }}>
                                    <Plus size={15} /> Add Medicine
                                </button>
                            </form>
                        </div>

                        {/* Medicine Table */}
                        <div>
                            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                                Current Inventory
                                <span style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 400 }}>{medicines.length} items</span>
                            </h2>
                            <div className="glass-card" style={{ overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.03)' }}>
                                            {['Medicine', 'Price', 'Stock', ''].map(h => (
                                                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {medicines.map(med => (
                                            <tr key={med._id} style={{ borderBottom: '1px solid var(--color-border)' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <td style={{ padding: '12px 16px' }}>
                                                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{med.name}</div>
                                                    {med.category && <div style={{ fontSize: '11px', color: 'var(--color-text-dim)', marginTop: '2px' }}>{med.category}</div>}
                                                </td>
                                                <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-primary-light)', fontSize: '13px' }}>₹{med.price}</td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <span style={{ fontSize: '13px', fontWeight: 600, color: med.stock > 0 ? 'var(--color-success)' : 'var(--color-emergency)' }}>
                                                        {med.stock}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <button
                                                        onClick={() => deleteMedicine(med._id)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-dim)', padding: '4px', borderRadius: '4px', transition: 'color 0.2s' }}
                                                        onMouseEnter={e => e.currentTarget.style.color = 'var(--color-emergency)'}
                                                        onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-dim)'}
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {medicines.length === 0 && (
                                            <tr>
                                                <td colSpan={4} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--color-text-dim)', fontSize: '13px' }}>
                                                    No medicines added yet
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PharmacyDashboard;
