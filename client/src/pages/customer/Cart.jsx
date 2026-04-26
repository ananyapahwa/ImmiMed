import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import {
    Trash2, Zap, ZapOff, ShoppingBag, ArrowLeft,
    Plus, Minus, AlertTriangle, CheckCircle2
} from 'lucide-react';

const Cart = () => {
    const {
        cart, removeFromCart, updateQuantity, clearCart,
        isEmergency, toggleEmergency, emergencyFee, subtotal, total, EMERGENCY_FEE,
    } = useCart();
    const navigate = useNavigate();
    const [address, setAddress] = useState('');
    const [placing, setPlacing] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (!address.trim()) { alert('Please enter a delivery address'); return; }
        setPlacing(true);

        const pharmacyGroups = {};
        cart.forEach(item => {
            if (!pharmacyGroups[item.pharmacyId]) pharmacyGroups[item.pharmacyId] = [];
            pharmacyGroups[item.pharmacyId].push(item);
        });

        try {
            const token = localStorage.getItem('token');
            for (const pharmacyId in pharmacyGroups) {
                const items = pharmacyGroups[pharmacyId].map(item => ({
                    medicineId: item._id,
                    quantity: item.quantity,
                }));
                await axios.post('http://localhost:5000/api/orders', {
                    pharmacyId,
                    items,
                    deliveryAddress: address,
                    isEmergency,
                }, { headers: { 'x-auth-token': token } });
            }
            clearCart();
            setSuccess(true);
            setTimeout(() => navigate('/customer/dashboard'), 2000);
        } catch (err) {
            console.error(err);
            alert('Failed to place order. Please try again.');
        } finally {
            setPlacing(false);
        }
    };

    if (success) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={36} color="var(--color-success)" />
                </div>
                <h2 style={{ fontWeight: 800, fontSize: '22px' }}>Order Placed!</h2>
                {isEmergency && <p style={{ color: 'var(--color-emergency-light)', fontSize: '14px' }}>🚨 Your emergency order has been flagged for priority delivery.</p>}
                <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Redirecting to dashboard…</p>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShoppingBag size={32} color="var(--color-text-dim)" />
                </div>
                <h2 style={{ fontWeight: 700, color: 'var(--color-text-muted)' }}>Your cart is empty</h2>
                <button className="btn btn-primary" onClick={() => navigate('/customer/dashboard')}>
                    <ArrowLeft size={14} /> Browse Pharmacies
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 24px 80px' }}>
            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
                <button
                    className="btn btn-ghost btn-sm"
                    style={{ marginBottom: '16px' }}
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={14} /> Back
                </button>
                <h1 style={{ fontSize: '26px', fontWeight: 800 }}>Your Cart</h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
            </div>

            {/* Cart Items */}
            <div className="glass-card" style={{ marginBottom: '20px', overflow: 'hidden' }}>
                {cart.map((item, i) => (
                    <div key={item._id} style={{
                        display: 'flex', alignItems: 'center', gap: '16px',
                        padding: '16px 20px',
                        borderBottom: i < cart.length - 1 ? '1px solid var(--color-border)' : 'none',
                    }}>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontWeight: 600, fontSize: '15px', marginBottom: '2px' }}>{item.name}</h3>
                            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>₹{item.price} each</p>
                        </div>

                        {/* Quantity stepper */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                                className="btn btn-ghost btn-sm"
                                style={{ padding: '4px 8px', borderRadius: '6px' }}
                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            >
                                <Minus size={12} />
                            </button>
                            <span style={{ fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                            <button
                                className="btn btn-ghost btn-sm"
                                style={{ padding: '4px 8px', borderRadius: '6px' }}
                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            >
                                <Plus size={12} />
                            </button>
                        </div>

                        <span style={{ fontWeight: 700, minWidth: '60px', textAlign: 'right', color: 'var(--color-primary-light)' }}>
                            ₹{(item.price * item.quantity).toFixed(2)}
                        </span>

                        <button
                            onClick={() => removeFromCart(item._id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-dim)', padding: '4px', borderRadius: '6px', transition: 'color 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-emergency)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-dim)'}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Delivery Address */}
            <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '10px' }}>
                    📍 Delivery Address
                </label>
                <textarea
                    className="input-dark"
                    placeholder="Enter your complete delivery address…"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    rows={3}
                    style={{ resize: 'vertical', lineHeight: 1.6 }}
                />
            </div>

            {/* Emergency Toggle */}
            <div
                onClick={toggleEmergency}
                style={{
                    padding: '18px 20px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '20px',
                    border: isEmergency ? '1px solid rgba(239,68,68,0.5)' : '1px solid var(--color-border)',
                    background: isEmergency ? 'rgba(239,68,68,0.08)' : 'var(--color-surface)',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    boxShadow: isEmergency ? 'var(--shadow-emergency)' : 'none',
                }}
                className={isEmergency ? 'emergency-pulse' : ''}
            >
                <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: isEmergency ? 'rgba(239,68,68,0.2)' : 'var(--color-surface)',
                    border: `1px solid ${isEmergency ? 'rgba(239,68,68,0.4)' : 'var(--color-border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.3s',
                }}>
                    {isEmergency
                        ? <Zap size={20} color="var(--color-emergency)" />
                        : <ZapOff size={20} color="var(--color-text-dim)" />
                    }
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: isEmergency ? 'var(--color-emergency-light)' : 'var(--color-text)', marginBottom: '2px' }}>
                        {isEmergency ? '🚨 Emergency Delivery Enabled' : 'Enable Emergency Delivery'}
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {isEmergency
                            ? `Priority handling + ₹${EMERGENCY_FEE} surcharge added. Your order will be flagged for urgent dispatch.`
                            : `Tap to enable priority delivery for ₹${EMERGENCY_FEE} extra.`
                        }
                    </p>
                </div>
                {/* Toggle pill */}
                <div style={{
                    width: '44px', height: '24px', borderRadius: '100px',
                    background: isEmergency ? 'var(--color-emergency)' : 'var(--color-border)',
                    position: 'relative', transition: 'all 0.3s', flexShrink: 0,
                }}>
                    <div style={{
                        width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                        position: 'absolute', top: '3px',
                        left: isEmergency ? '23px' : '3px',
                        transition: 'left 0.3s',
                    }} />
                </div>
            </div>

            {/* Order Summary */}
            <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
                <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>Order Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--color-text-muted)' }}>
                        <span>Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    {isEmergency && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--color-emergency-light)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Zap size={13} /> Emergency Surcharge
                            </span>
                            <span>+₹{emergencyFee}</span>
                        </div>
                    )}
                    <div className="divider" style={{ margin: '4px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '18px' }}>
                        <span>Total</span>
                        <span style={{ color: isEmergency ? 'var(--color-emergency-light)' : 'var(--color-primary-light)' }}>
                            ₹{total.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            <button
                onClick={handleCheckout}
                disabled={placing}
                className={`btn btn-full ${isEmergency ? 'btn-emergency' : 'btn-primary'}`}
                style={{ padding: '14px', fontSize: '16px', fontWeight: 700 }}
            >
                {placing ? 'Placing Order…' : isEmergency ? '🚨 Place Emergency Order' : 'Place Order'}
            </button>
        </div>
    );
};

export default Cart;
