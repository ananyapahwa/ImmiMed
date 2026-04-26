import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [isEmergency, setIsEmergency] = useState(false);

    const EMERGENCY_FEE = 50;

    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (medicine) => {
        setCart(prev => {
            const existing = prev.find(item => item._id === medicine._id);
            if (existing) {
                return prev.map(item =>
                    item._id === medicine._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...medicine, quantity: 1 }];
        });
    };

    const removeFromCart = (medicineId) => {
        setCart(prev => prev.filter(item => item._id !== medicineId));
    };

    const updateQuantity = (medicineId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(medicineId);
            return;
        }
        setCart(prev =>
            prev.map(item => item._id === medicineId ? { ...item, quantity } : item)
        );
    };

    const clearCart = () => {
        setCart([]);
        setIsEmergency(false);
    };

    const toggleEmergency = () => setIsEmergency(prev => !prev);

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const emergencyFee = isEmergency ? EMERGENCY_FEE : 0;
    const total = subtotal + emergencyFee;

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            isEmergency,
            toggleEmergency,
            emergencyFee,
            subtotal,
            total,
            EMERGENCY_FEE,
        }}>
            {children}
        </CartContext.Provider>
    );
};
