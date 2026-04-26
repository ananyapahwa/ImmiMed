import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    ShieldCheck, Store, Users, Package, Zap, RefreshCw,
    CheckCircle2, XCircle, Trash2, AlertTriangle, Clock,
    TrendingUp, Eye, ChevronDown, ChevronUp, MapPin, Phone, Mail
} from 'lucide-react';

const API = 'http://localhost:5000/api/admin';
const headers = () => ({ 'x-auth-token': localStorage.getItem('token') });

const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
});

const statusBadge = (status) => {
    const map = {
        pending: 'badge badge-pending',
        confirmed: 'badge badge-confirmed',
        ready_for_pickup: 'badge badge-ready',
        out_for_delivery: 'badge badge-confirmed',
        delivered: 'badge badge-delivered',
        cancelled: 'badge badge-cancelled',
    };
    return <span className={map[status] || 'badge badge-pending'}>{status.replace(/_/g, ' ')}</span>;
};

const AdminDashboard = () => {
    const [tab, setTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [pharmacies, setPharmacies] = useState([]);
    const [pharmFilter, setPharmFilter] = useState('all'); // all | pending | approved
    const [orders, setOrders] = useState([]);
    const [orderFilter, setOrderFilter] = useState('all'); // all | emergency
    const [users, setUsers] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [expanded, setExpanded] = useState({});
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchAll = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([fetchStats(), fetchPharmacies(pharmFilter), fetchOrders(orderFilter), fetchUsers()]);
        setRefreshing(false);
    }, [pharmFilter, orderFilter]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const fetchStats = async () => {
        try {
            const res = await axios.get(`${API}/stats`, { headers: headers() });
            setStats(res.data);
        } catch { /* ignore */ }
    };

    const fetchPharmacies = async (filter) => {
        try {
            const param = filter !== 'all' ? `?status=${filter}` : '';
            const res = await axios.get(`${API}/pharmacies${param}`, { headers: headers() });
            setPharmacies(res.data);
        } catch { /* ignore */ }
    };

    const fetchOrders = async (filter) => {
        try {
            const param = filter === 'emergency' ? '?emergency=true' : '';
            const res = await axios.get(`${API}/orders${param}`, { headers: headers() });
            setOrders(res.data);
        } catch { /* ignore */ }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API}/users`, { headers: headers() });
            setUsers(res.data);
        } catch { /* ignore */ }
    };

    const approvePharmacy = async (id) => {
        try {
            await axios.put(`${API}/pharmacies/${id}/approve`, {}, { headers: headers() });
            showToast('Pharmacy approved ✓');
            fetchPharmacies(pharmFilter);
            fetchStats();
        } catch { showToast('Failed to approve', 'error'); }
    };

    const rejectPharmacy = async (id) => {
        try {
            await axios.put(`${API}/pharmacies/${id}/reject`, {}, { headers: headers() });
            showToast('Pharmacy suspended');
            fetchPharmacies(pharmFilter);
            fetchStats();
        } catch { showToast('Failed', 'error'); }
    };

    const deletePharmacy = async (id) => {
        if (!window.confirm('Permanently delete this pharmacy and all its data?')) return;
        try {
            await axios.delete(`${API}/pharmacies/${id}`, { headers: headers() });
            showToast('Pharmacy deleted');
            fetchPharmacies(pharmFilter);
            fetchStats();
        } catch { showToast('Failed', 'error'); }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            await axios.delete(`${API}/users/${id}`, { headers: headers() });
            showToast('User deleted');
            fetchUsers();
        } catch { showToast('Failed', 'error'); }
    };

    const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

    const statCards = stats ? [
        { label: 'Total Users', value: stats.totalUsers, icon: <Users size={20} />, color: 'var(--color-primary-light)' },
        { label: 'Total Pharmacies', value: stats.totalPharmacies, icon: <Store size={20} />, color: 'var(--color-success)' },
        { label: 'Pending Approval', value: stats.pendingPharmacies, icon: <Clock size={20} />, color: '#fcd34d', alert: stats.pendingPharmacies > 0 },
        { label: 'Total Orders', value: stats.totalOrders, icon: <Package size={20} />, color: 'var(--color-primary-light)' },
        { label: 'Emergency Orders', value: stats.emergencyOrders, icon: <Zap size={20} />, color: 'var(--color-emergency-light)' },
    ] : [];

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <TrendingUp size={14} /> },
        { id: 'pharmacies', label: 'Pharmacies', icon: <Store size={14} />, badge: stats?.pendingPharmacies },
        { id: 'orders', label: 'Orders', icon: <Package size={14} /> },
        { id: 'users', label: 'Users', icon: <Users size={14} /> },
    ];

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '60px' }}>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: '80px', right: '24px', zIndex: 999,
                    background: toast.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                    border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.4)'}`,
                    color: toast.type === 'error' ? 'var(--color-emergency-light)' : '#86efac',
                    padding: '12px 18px', borderRadius: '10px',
                    fontSize: '14px', fontWeight: 600,
                    backdropFilter: 'blur(12px)',
                    boxShadow: 'var(--shadow-md)',
                    animation: 'slideUp 0.3s ease',
                }}>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 50%, transparent 100%)',
                borderBottom: '1px solid var(--color-border)',
                padding: '28px 32px',
                marginBottom: '32px',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '14px',
                            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: 'var(--shadow-primary)',
                        }}>
                            <ShieldCheck size={22} color="#fff" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '2px' }}>Admin Panel</h1>
                            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>PharmaPlatform Control Centre</p>
                        </div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={fetchAll} disabled={refreshing}>
                        <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                        {refreshing ? 'Refreshing…' : 'Refresh'}
                    </button>
                </div>

                {/* Stat cards */}
                {stats && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginTop: '24px' }}>
                        {statCards.map(s => (
                            <div key={s.label}
                                className="stat-card"
                                style={s.alert ? { borderColor: 'rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.06)' } : {}}
                            >
                                <div style={{ color: s.color, marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
                                <div className="stat-value" style={{ color: s.color, fontSize: '24px' }}>{s.value}</div>
                                <div className="stat-label">{s.label}</div>
                                {s.alert && <div style={{ fontSize: '10px', color: '#fcd34d', marginTop: '4px' }}>Needs attention</div>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ padding: '0 32px' }}>
                {/* Tab bar */}
                <div className="tab-bar" style={{ maxWidth: '520px', marginBottom: '28px' }}>
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            className={`tab-item${tab === t.id ? ' active' : ''}`}
                            onClick={() => setTab(t.id)}
                            style={{ position: 'relative' }}
                        >
                            {t.icon} {t.label}
                            {t.badge > 0 && (
                                <span style={{
                                    background: tab === t.id ? 'rgba(255,255,255,0.3)' : '#f59e0b',
                                    color: '#000', borderRadius: '100px',
                                    fontSize: '10px', fontWeight: 800, padding: '1px 6px',
                                }}>
                                    {t.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ===== OVERVIEW TAB ===== */}
                {tab === 'overview' && (
                    <div>
                        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Recent Orders</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {stats?.recentOrders?.map(order => (
                                <div key={order._id} className={`order-card${order.isEmergency ? ' emergency-card' : ''}`}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <span style={{ fontWeight: 700, fontSize: '14px' }}>#{order._id.slice(-6).toUpperCase()}</span>
                                                {order.isEmergency && <span className="badge badge-emergency urgent-blink">🚨 EMERGENCY</span>}
                                                {statusBadge(order.status)}
                                            </div>
                                            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                                Customer: {order.customerId?.name || 'N/A'} · Pharmacy: {order.pharmacyId?.pharmacyName || 'N/A'}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 800, color: order.isEmergency ? 'var(--color-emergency-light)' : 'var(--color-primary-light)' }}>
                                                ₹{order.totalAmount}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>{formatDate(order.createdAt)}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                                <p style={{ color: 'var(--color-text-dim)', textAlign: 'center', padding: '40px' }}>No recent orders</p>
                            )}
                        </div>

                        {/* Quick actions */}
                        {stats?.pendingPharmacies > 0 && (
                            <div style={{
                                marginTop: '24px',
                                background: 'rgba(245,158,11,0.08)',
                                border: '1px solid rgba(245,158,11,0.3)',
                                borderRadius: 'var(--radius-md)',
                                padding: '16px 20px',
                                display: 'flex', alignItems: 'center', gap: '12px',
                            }}>
                                <AlertTriangle size={18} color="#f59e0b" />
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 700, fontSize: '14px', color: '#fcd34d', marginBottom: '2px' }}>
                                        {stats.pendingPharmacies} Pharmacies Awaiting Approval
                                    </p>
                                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                        New pharmacies cannot serve customers until approved.
                                    </p>
                                </div>
                                <button className="btn btn-sm" style={{ background: '#f59e0b', color: '#000', fontWeight: 700 }} onClick={() => { setPharmFilter('pending'); setTab('pharmacies'); }}>
                                    Review Now →
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ===== PHARMACIES TAB ===== */}
                {tab === 'pharmacies' && (
                    <div>
                        {/* Filter */}
                        <div className="tab-bar" style={{ maxWidth: '340px', marginBottom: '20px' }}>
                            {[['all', 'All'], ['pending', 'Pending'], ['approved', 'Approved']].map(([v, l]) => (
                                <button
                                    key={v}
                                    className={`tab-item${pharmFilter === v ? ' active' : ''}`}
                                    onClick={() => { setPharmFilter(v); fetchPharmacies(v); }}
                                >
                                    {l}
                                    {v === 'pending' && stats?.pendingPharmacies > 0 && (
                                        <span style={{ background: pharmFilter === 'pending' ? 'rgba(255,255,255,0.3)' : '#f59e0b', color: '#000', borderRadius: '100px', fontSize: '10px', fontWeight: 800, padding: '1px 6px' }}>
                                            {stats.pendingPharmacies}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {pharmacies.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-dim)' }}>
                                    <Store size={36} style={{ opacity: 0.3, marginBottom: '12px' }} />
                                    <p>No pharmacies in this category</p>
                                </div>
                            )}
                            {pharmacies.map(pharmacy => (
                                <div key={pharmacy._id}
                                    className={`order-card${!pharmacy.isApproved ? ' animate-fade-in' : ''}`}
                                    style={!pharmacy.isApproved ? {
                                        borderColor: 'rgba(245,158,11,0.4)',
                                        background: 'rgba(245,158,11,0.04)',
                                    } : {}}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                                        {/* Left */}
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                                <div style={{
                                                    width: '36px', height: '36px', borderRadius: '10px',
                                                    background: pharmacy.isApproved ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    flexShrink: 0,
                                                }}>
                                                    <Store size={16} color={pharmacy.isApproved ? 'var(--color-success)' : '#f59e0b'} />
                                                </div>
                                                <div>
                                                    <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>
                                                        {pharmacy.pharmacyName}
                                                    </h3>
                                                    <span className={`badge ${pharmacy.isApproved ? 'badge-delivered' : 'badge-pending'}`}>
                                                        {pharmacy.isApproved ? '✓ Approved' : '⏳ Pending'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <MapPin size={10} /> {pharmacy.address}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Phone size={10} /> {pharmacy.contactNumber}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Mail size={10} /> {pharmacy.userId?.email}
                                                </span>
                                            </div>

                                            {/* Expandable details */}
                                            <button
                                                onClick={() => toggleExpand(pharmacy._id)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-dim)', fontSize: '12px', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'Inter, sans-serif' }}
                                            >
                                                {expanded[pharmacy._id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                                {expanded[pharmacy._id] ? 'Hide details' : 'More details'}
                                            </button>

                                            {expanded[pharmacy._id] && (
                                                <div style={{ marginTop: '10px', padding: '12px', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--color-text-muted)', display: 'grid', gap: '6px' }}>
                                                    <div><span style={{ color: 'var(--color-text-dim)' }}>Owner:</span> {pharmacy.userId?.name} ({pharmacy.userId?.email})</div>
                                                    <div><span style={{ color: 'var(--color-text-dim)' }}>Registered:</span> {formatDate(pharmacy.createdAt)}</div>
                                                    <div><span style={{ color: 'var(--color-text-dim)' }}>Location:</span> {pharmacy.location?.coordinates?.length > 0 ? `${pharmacy.location.coordinates[1].toFixed(4)}, ${pharmacy.location.coordinates[0].toFixed(4)}` : 'Not set'}</div>
                                                    <div><span style={{ color: 'var(--color-text-dim)' }}>Hours:</span> {pharmacy.operatingHours || 'Not set'}</div>
                                                    <div><span style={{ color: 'var(--color-text-dim)' }}>Total Orders:</span> {pharmacy.totalOrders || 0}</div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'flex-start' }}>
                                            {!pharmacy.isApproved ? (
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => approvePharmacy(pharmacy._id)}
                                                >
                                                    <CheckCircle2 size={13} /> Approve
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn btn-sm"
                                                    style={{ background: 'rgba(245,158,11,0.15)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.3)' }}
                                                    onClick={() => rejectPharmacy(pharmacy._id)}
                                                >
                                                    <XCircle size={13} /> Suspend
                                                </button>
                                            )}
                                            <button
                                                className="btn btn-sm"
                                                style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--color-emergency-light)', border: '1px solid rgba(239,68,68,0.3)' }}
                                                onClick={() => deletePharmacy(pharmacy._id)}
                                            >
                                                <Trash2 size={13} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ===== ORDERS TAB ===== */}
                {tab === 'orders' && (
                    <div>
                        {/* Filter */}
                        <div className="tab-bar" style={{ maxWidth: '260px', marginBottom: '20px' }}>
                            <button className={`tab-item${orderFilter === 'all' ? ' active' : ''}`} onClick={() => { setOrderFilter('all'); fetchOrders('all'); }}>
                                All Orders
                            </button>
                            <button className={`tab-item emergency-tab${orderFilter === 'emergency' ? ' active' : ''}`} onClick={() => { setOrderFilter('emergency'); fetchOrders('emergency'); }}>
                                <Zap size={13} /> Emergency
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {orders.length === 0 && <p style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-dim)' }}>No orders found</p>}
                            {orders.map(order => (
                                <div key={order._id} className={`order-card${order.isEmergency ? ' emergency-card' : ''}`}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                                <span style={{ fontWeight: 700, fontSize: '14px' }}>#{order._id.slice(-6).toUpperCase()}</span>
                                                {order.isEmergency && <span className="badge badge-emergency urgent-blink">🚨 EMERGENCY</span>}
                                                {statusBadge(order.status)}
                                            </div>
                                            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
                                                <span><Users size={10} style={{ display: 'inline', marginRight: '3px' }} />{order.customerId?.name || 'N/A'}</span>
                                                <span><Store size={10} style={{ display: 'inline', marginRight: '3px' }} />{order.pharmacyId?.pharmacyName || 'N/A'}</span>
                                                <span><MapPin size={10} style={{ display: 'inline', marginRight: '3px' }} />{order.deliveryAddress}</span>
                                            </div>
                                            <p style={{ fontSize: '11px', color: 'var(--color-text-dim)', marginTop: '4px' }}>
                                                {order.items?.map(i => `${i.name} ×${i.quantity}`).join(' · ')}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 800, fontSize: '16px', color: order.isEmergency ? 'var(--color-emergency-light)' : 'var(--color-primary-light)' }}>
                                                ₹{order.totalAmount}
                                                {order.isEmergency && <span style={{ fontSize: '10px', color: 'var(--color-text-dim)', display: 'block' }}>incl. ₹{order.emergencySurcharge} fee</span>}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--color-text-dim)', marginTop: '2px' }}>{formatDate(order.createdAt)}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ===== USERS TAB ===== */}
                {tab === 'users' && (
                    <div>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>{users.length} registered users</p>
                        <div className="glass-card" style={{ overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.03)' }}>
                                        {['Name', 'Email', 'Role', 'Joined', ''].map(h => (
                                            <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u._id}
                                            style={{ borderBottom: '1px solid var(--color-border)' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '13px' }}>{u.name}</td>
                                            <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--color-text-muted)' }}>{u.email}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span className="badge" style={{
                                                    background: u.role === 'admin' ? 'rgba(99,102,241,0.2)' : u.role === 'pharmacy' ? 'rgba(34,197,94,0.15)' : u.role === 'delivery' ? 'rgba(245,158,11,0.15)' : 'rgba(100,116,139,0.15)',
                                                    color: u.role === 'admin' ? 'var(--color-primary-light)' : u.role === 'pharmacy' ? '#86efac' : u.role === 'delivery' ? '#fcd34d' : 'var(--color-text-muted)',
                                                    border: '1px solid transparent',
                                                }}>
                                                    {u.role === 'admin' ? '🛡️ ' : ''}{u.role}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--color-text-dim)' }}>{formatDate(u.createdAt)}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                {u.role !== 'admin' && (
                                                    <button
                                                        onClick={() => deleteUser(u._id)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-dim)', padding: '4px', borderRadius: '4px', transition: 'color 0.2s' }}
                                                        onMouseEnter={e => e.currentTarget.style.color = 'var(--color-emergency)'}
                                                        onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-dim)'}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-dim)' }}>No users found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
