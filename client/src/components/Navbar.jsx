import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, LogOut, Pill, Zap, ShieldCheck } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cart, isEmergency } = useCart();
    const navigate = useNavigate();
    const cartCount = cart.reduce((acc, i) => acc + i.quantity, 0);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{
            background: 'rgba(10,10,20,0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--color-border)',
            padding: '0 32px',
            position: 'sticky',
            top: 0,
            zIndex: 100,
        }}>
            <div style={{
                maxWidth: '1280px',
                margin: '0 auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '60px',
            }}>
                {/* Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 12px rgba(99,102,241,0.4)',
                    }}>
                        <Pill size={16} color="#fff" />
                    </div>
                    <span style={{
                        fontWeight: 800, fontSize: '17px', letterSpacing: '-0.3px',
                        background: 'linear-gradient(90deg, #f1f5f9, #818cf8)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        PharmaPlatform
                    </span>
                </Link>

                {/* Right */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {user ? (
                        <>
                            <span style={{
                                fontSize: '13px', color: 'var(--color-text-muted)',
                                background: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '100px',
                                padding: '5px 14px',
                            }}>
                                {user.name}
                                <span style={{ marginLeft: '6px', color: 'var(--color-primary-light)', fontWeight: 600 }}>
                                    · {user.role}
                                </span>
                            </span>

                            {user.role === 'admin' && (
                                <Link to="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary-light)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '8px', padding: '6px 12px', transition: 'all 0.2s' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.2)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; }}
                                >
                                    <ShieldCheck size={14} /> Admin Panel
                                </Link>
                            )}

                            {user.role === 'customer' && (
                                <Link to="/cart" style={{ position: 'relative', color: 'var(--color-text-muted)', display: 'flex', transition: 'color 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text)'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
                                >
                                    <ShoppingCart size={22} />
                                    {cartCount > 0 && (
                                        <span style={{
                                            position: 'absolute', top: '-8px', right: '-8px',
                                            background: isEmergency ? 'var(--color-emergency)' : 'var(--color-primary)',
                                            color: '#fff', borderRadius: '100px',
                                            fontSize: '10px', fontWeight: 700,
                                            minWidth: '18px', height: '18px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            padding: '0 4px',
                                        }}>
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                            )}

                            {isEmergency && user.role === 'customer' && (
                                <span style={{
                                    fontSize: '11px', fontWeight: 700,
                                    color: 'var(--color-emergency-light)',
                                    background: 'rgba(239,68,68,0.12)',
                                    border: '1px solid rgba(239,68,68,0.3)',
                                    borderRadius: '100px',
                                    padding: '4px 10px',
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                }}>
                                    <Zap size={11} /> Emergency
                                </span>
                            )}

                            <button
                                onClick={handleLogout}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    background: 'none', border: '1px solid var(--color-border)',
                                    borderRadius: '8px', padding: '6px 12px',
                                    cursor: 'pointer', color: 'var(--color-text-muted)',
                                    fontSize: '13px', fontFamily: 'Inter, sans-serif',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-emergency-light)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                            >
                                <LogOut size={15} /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
                            >
                                Login
                            </Link>
                            <Link to="/register" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
