import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Truck, CheckCircle2, Zap, Package, RefreshCw, AlertTriangle, Clock } from 'lucide-react';

const API = 'http://localhost:5000/api';
const headers = () => ({ 'x-auth-token': localStorage.getItem('token') });

const DeliveryDashboard = () => {
    const [availableOrders, setAvailableOrders] = useState([]);
    const [myDeliveries, setMyDeliveries] = useState([]);
    const [tab, setTab] = useState('available');
    const [refreshing, setRefreshing] = useState(false);

    const fetchAll = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([fetchAvailable(), fetchMine()]);
        setRefreshing(false);
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const fetchAvailable = async () => {
        try {
            const res = await axios.get(`${API}/orders/available-orders`, { headers: headers() });
            setAvailableOrders(res.data);
        } catch { /* ignore */ }
    };

    const fetchMine = async () => {
        try {
            const res = await axios.get(`${API}/orders/my-deliveries`, { headers: headers() });
            setMyDeliveries(res.data);
        } catch { /* ignore */ }
    };

    const acceptOrder = async (orderId) => {
        try {
            await axios.put(`${API}/orders/${orderId}/status`, { status: 'out_for_delivery' }, { headers: headers() });
            fetchAll();
        } catch { /* ignore */ }
    };

    const markDelivered = async (orderId) => {
        try {
            await axios.put(`${API}/orders/${orderId}/status`, { status: 'delivered' }, { headers: headers() });
            fetchMine();
        } catch { /* ignore */ }
    };

    const emergencyAvailable = availableOrders.filter(o => o.isEmergency);
    const standardAvailable = availableOrders.filter(o => !o.isEmergency);
    const totalDelivered = myDeliveries.filter(o => o.status === 'delivered').length;
    const emergencyDeliveries = myDeliveries.filter(o => o.isEmergency).length;

    const statCards = [
        { label: 'Available', value: availableOrders.length, color: 'var(--color-primary-light)' },
        { label: '🚨 Urgent', value: emergencyAvailable.length, color: 'var(--color-emergency-light)' },
        { label: 'My Active', value: myDeliveries.filter(o => o.status !== 'delivered').length, color: '#fcd34d' },
        { label: 'Delivered', value: totalDelivered, color: 'var(--color-success)' },
    ];

    const renderAvailableCard = (order) => (
        <div key={order._id}
            className={`order-card${order.isEmergency ? ' emergency-card animate-slide-up' : ' animate-slide-up'}`}
            style={order.isEmergency ? { boxShadow: '0 0 0 1px rgba(239,68,68,0.5), 0 4px 20px rgba(239,68,68,0.12)' } : {}}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{ fontWeight: 700, fontSize: '15px' }}>Order #{order._id.slice(-6).toUpperCase()}</h3>
                        {order.isEmergency && (
                            <span className="badge badge-emergency urgent-blink">🚨 URGENT</span>
                        )}
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                        📍 {order.deliveryAddress}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>
                        {order.items?.map(i => `${i.name} ×${i.quantity}`).join(' · ')}
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '17px', color: order.isEmergency ? 'var(--color-emergency-light)' : 'var(--color-primary-light)' }}>
                        ₹{order.totalAmount}
                    </div>
                    {order.isEmergency && (
                        <div style={{ fontSize: '10px', color: 'var(--color-text-dim)' }}>+₹{order.emergencySurcharge} fee</div>
                    )}
                </div>
            </div>
            <button
                onClick={() => acceptOrder(order._id)}
                className={`btn btn-full ${order.isEmergency ? 'btn-emergency' : 'btn-primary'}`}
            >
                <Truck size={14} />
                {order.isEmergency ? '🚨 Accept Emergency Delivery' : 'Accept Delivery'}
            </button>
        </div>
    );

    const renderMyCard = (order) => (
        <div key={order._id}
            className={`order-card${order.isEmergency ? ' emergency-card' : ''}`}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{ fontWeight: 700, fontSize: '15px' }}>Order #{order._id.slice(-6).toUpperCase()}</h3>
                        {order.isEmergency && <span className="badge badge-emergency">🚨 EMERGENCY</span>}
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>📍 {order.deliveryAddress}</p>
                </div>
                <div>
                    {order.status === 'delivered' ? (
                        <span className="badge badge-delivered"><CheckCircle2 size={10} /> Delivered</span>
                    ) : (
                        <span className="badge badge-confirmed">Out for Delivery</span>
                    )}
                </div>
            </div>
            {order.status !== 'delivered' && (
                <button className="btn btn-success btn-full" onClick={() => markDelivered(order._id)}>
                    <CheckCircle2 size={14} /> Mark as Delivered
                </button>
            )}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>Delivery Dashboard</h1>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Manage your deliveries</p>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={fetchAll} disabled={refreshing}>
                        <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                        {refreshing ? 'Refreshing…' : 'Refresh'}
                    </button>
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
                <div className="tab-bar" style={{ maxWidth: '360px', marginBottom: '28px' }}>
                    <button className={`tab-item${tab === 'available' ? ' active' : ''}`} onClick={() => setTab('available')}>
                        <Package size={14} /> Available Orders
                        {availableOrders.length > 0 && (
                            <span style={{ background: tab === 'available' ? 'rgba(255,255,255,0.3)' : 'var(--color-primary)', color: '#fff', borderRadius: '100px', fontSize: '10px', fontWeight: 800, padding: '1px 6px' }}>
                                {availableOrders.length}
                            </span>
                        )}
                    </button>
                    <button className={`tab-item${tab === 'mine' ? ' active' : ''}`} onClick={() => setTab('mine')}>
                        <Truck size={14} /> My Deliveries
                    </button>
                </div>

                {/* Available Orders */}
                {tab === 'available' && (
                    <div>
                        {/* Emergency section */}
                        {emergencyAvailable.length > 0 && (
                            <div style={{ marginBottom: '28px' }}>
                                <div style={{
                                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
                                    borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '16px',
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                }}>
                                    <AlertTriangle size={16} color="var(--color-emergency)" className="urgent-blink" />
                                    <span style={{ fontSize: '13px', color: 'var(--color-emergency-light)', fontWeight: 600 }}>
                                        {emergencyAvailable.length} EMERGENCY order{emergencyAvailable.length !== 1 ? 's' : ''} — Accept these first!
                                    </span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    {emergencyAvailable.map(renderAvailableCard)}
                                </div>
                            </div>
                        )}

                        {/* Standard orders */}
                        {standardAvailable.length > 0 && (
                            <div>
                                {emergencyAvailable.length > 0 && (
                                    <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Standard Orders
                                    </h3>
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    {standardAvailable.map(renderAvailableCard)}
                                </div>
                            </div>
                        )}

                        {availableOrders.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-dim)' }}>
                                <Package size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                                <p>No orders available for pickup</p>
                                <p style={{ fontSize: '12px', marginTop: '6px' }}>Check back in a moment or tap Refresh</p>
                            </div>
                        )}
                    </div>
                )}

                {/* My Deliveries */}
                {tab === 'mine' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {myDeliveries.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-dim)' }}>
                                <Truck size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                                <p>No deliveries assigned yet</p>
                            </div>
                        ) : myDeliveries.map(renderMyCard)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryDashboard;
