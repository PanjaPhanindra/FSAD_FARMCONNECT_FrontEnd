import React, { useContext } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "./context/AuthContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ProductProvider } from "./context/ProductContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Verify from "./pages/Verify.jsx";
// Components
import NavBar from "./components/NavBar.jsx";
import Footer from "./components/Footer.jsx";
import Alert from "./components/Alert.jsx";
import Modal from "./components/Modal.jsx";

// Public Pages
import Welcome from "./pages/Welcome.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import FAQ from "./pages/FAQ.jsx";
import Terms from "./pages/Terms.jsx";
import Privacy from "./pages/Privacy.jsx";

// Auth Pages
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";

// Buyer Pages
import BuyerDashboard from "./pages/BuyerDashboard.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Orders from "./pages/Orders.jsx";

// Seller Pages
import SellerDashboard from "./pages/SellerDashboard.jsx";
import AddProduct from "./pages/AddProduct.jsx";

// Admin Pages
import AdminUsers from "./pages/AdminUsers.jsx";

// Other Pages
import Profile from "./pages/Profile.jsx";

/**
 * ProtectedRoute Component
 * Checks authentication and role before allowing access
 */
function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useContext(AuthContext);

  // While restoring user from localStorage, don't redirect yet
  if (loading) {
    return null; // or a loader component
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role if specified
  if (requiredRole) {
    const rolesArray = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!rolesArray.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

/**
 * AppRoutes Component
 */
function AppRoutes() {
  const location = useLocation();
  const hideHeaderFooter = ["/login", "/register"].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-green-50 via-white to-blue-50">
      {!hideHeaderFooter && <NavBar />}

      <main className="flex-1 flex flex-col justify-center items-center w-full px-4 py-6">
        <Routes>
          {/* =========== PUBLIC ROUTES =========== */}
          <Route path="/" element={<Welcome />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* =========== AUTH ROUTES =========== */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
<Route path="/reset-password" element={<ResetPassword />} />
<Route path="/auth/verify" element={<Verify />} />

          {/* =========== BUYER ROUTES =========== */}
          <Route
            path="/buyer-dashboard"
            element={
              <ProtectedRoute requiredRole="buyer">
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute requiredRole="buyer">
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute requiredRole="buyer">
                <Orders />
              </ProtectedRoute>
            }
          />

          {/* =========== SELLER/FARMER ROUTES =========== */}
          <Route
            path="/seller-dashboard"
            element={
              <ProtectedRoute requiredRole={["seller", "farmer"]}>
                <SellerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-product"
            element={
              <ProtectedRoute requiredRole={["seller", "farmer"]}>
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/add"
            element={
              <ProtectedRoute requiredRole={["seller", "farmer"]}>
                <AddProduct />
              </ProtectedRoute>
            }
          />

          {/* =========== ADMIN ROUTES =========== */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          {/* =========== SHARED ROUTES =========== */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* =========== ERROR ROUTE =========== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!hideHeaderFooter && <Footer />}
      <Alert />
      <Modal />
    </div>
  );
}

/**
 * App Component - Root
 */
export default function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}
