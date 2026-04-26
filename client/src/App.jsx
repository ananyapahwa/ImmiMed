import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import PharmacyDashboard from './pages/pharmacy/Dashboard';
import CustomerDashboard from './pages/customer/Dashboard';
import PharmacyView from './pages/customer/PharmacyView';
import Cart from './pages/customer/Cart';
import DeliveryDashboard from './pages/delivery/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />; // Redirect to home if unauthorized
  }

  return children;
};

// Home Redirect Component
const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  if (user.role === 'pharmacy') return <Navigate to="/pharmacy/dashboard" />;
  if (user.role === 'delivery') return <Navigate to="/delivery/dashboard" />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
  return <Navigate to="/customer/dashboard" />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
            <Navbar />
            <div>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/" element={<HomeRedirect />} />

                {/* Pharmacy Routes */}
                <Route path="/pharmacy/dashboard" element={
                  <ProtectedRoute allowedRoles={['pharmacy']}>
                    <PharmacyDashboard />
                  </ProtectedRoute>
                } />

                {/* Customer Routes */}
                <Route path="/customer/dashboard" element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/pharmacy/:id" element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <PharmacyView />
                  </ProtectedRoute>
                } />
                <Route path="/cart" element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <Cart />
                  </ProtectedRoute>
                } />

                {/* Delivery Routes */}
                <Route path="/delivery/dashboard" element={
                  <ProtectedRoute allowedRoles={['delivery']}>
                    <DeliveryDashboard />
                  </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
