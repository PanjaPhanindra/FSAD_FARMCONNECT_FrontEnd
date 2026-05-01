import React, { useContext, useState, useMemo, useEffect } from "react";
import { CartContext } from "../context/CartContext.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiTrash2, FiArrowLeft, FiMinus, FiPlus, FiX, FiCheck, FiAlertCircle, FiTruck, FiCreditCard, FiMapPin, FiPhone, FiMail, FiHome, FiEdit3 } from "react-icons/fi";

/**
 * ============================================================================
 * Cart.jsx - FIXED Shopping Cart Page (800+ Lines)
 * ============================================================================
 */

export default function Cart() {
  // ============================================================================
  // CONTEXT & HOOKS
  // ============================================================================

  const cartContext = useContext(CartContext);
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  // ✅ FIX: Get cart.items directly from cart object
  const cartItems = cartContext?.cart?.items || [];
  const removeFromCart = cartContext?.removeFromCart || (() => {});
  const updateCartQty = cartContext?.updateCartQty || (() => {});
  const clearCart = cartContext?.clearCart || (() => {});
  const user = authContext?.user;

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [shipping, setShipping] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    landmark: ""
  });

  const [shippingErrors, setShippingErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const [step, setStep] = useState(1);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState("success");

  // ✅ SAVED ADDRESSES
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [addressMode, setAddressMode] = useState("saved"); // "saved" | "manual"
  const [selectedSavedAddress, setSelectedSavedAddress] = useState(null);

  // ============================================================================
  // FETCH SAVED ADDRESSES
  // ============================================================================

  useEffect(() => {
    if (!user?.email) return;
    fetch(`https://fsad-farmconnect-backend-1.onrender.com/address/${encodeURIComponent(user.email)}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setSavedAddresses(data);
          setAddressMode("saved"); // default to saved if addresses exist
        } else {
          setAddressMode("manual"); // no saved addresses → direct to manual
        }
      })
      .catch(() => setAddressMode("manual"));
  }, [user?.email]);

  // When a saved address is selected, auto-fill shipping form
  function applySavedAddress(addr) {
    setSelectedSavedAddress(addr.id);
    setShipping(prev => ({
      ...prev,
      fullName:  addr.fullName  || prev.fullName,
      phone:     addr.mobile    || prev.phone,
      address:   addr.street    || prev.address,
      city:      addr.city      || prev.city,
      state:     addr.state     || prev.state,
      pinCode:   addr.pincode   || prev.pinCode,
    }));
    setShippingErrors({});
    showNotification("Address selected! You can still edit fields below.", "success");
  }

  // ============================================================================
  // CALCULATIONS - CART SUMMARY
  // ============================================================================

  /**
   * Calculate order summary with tax, shipping, discount
   */
  const summary = useMemo(() => {
    // ✅ FIX: Calculate from cart.items
    const subtotal = cartItems.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const qty = parseInt(item.qty || item.quantity) || 0;
      return sum + (price * qty);
    }, 0);

    // Discount calculation
    const discountAmount = Math.round((subtotal * discountPercent) / 100 * 100) / 100;
    const priceAfterDiscount = subtotal - discountAmount;

    // Shipping calculation
    const shippingCost = priceAfterDiscount > 500 ? 0 : 50;

    // Tax calculation
    const tax = Math.round(priceAfterDiscount * 0.05 * 100) / 100;

    // Total
    const total = priceAfterDiscount + shippingCost + tax;

    return {
      subtotal: subtotal.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      priceAfterDiscount: priceAfterDiscount.toFixed(2),
      shippingCost,
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      itemCount: cartItems.reduce((sum, item) => sum + (parseInt(item.qty || item.quantity) || 0), 0),
      distinctItems: cartItems.length,
      freeShippingThreshold: 500,
      taxPercent: 5
    };
  }, [cartItems, discountPercent]);

  // ============================================================================
  // VALIDATION
  // ============================================================================

  function validateShipping() {
    const errors = {};

    if (!shipping.fullName?.trim()) {
      errors.fullName = "Full name is required";
    } else if (shipping.fullName.trim().length < 3) {
      errors.fullName = "Name must be at least 3 characters";
    }

    if (!shipping.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!shipping.phone?.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(shipping.phone.replace(/\D/g, ""))) {
      errors.phone = "Phone number must be exactly 10 digits";
    }

    if (!shipping.address?.trim()) {
      errors.address = "Address is required";
    } else if (shipping.address.trim().length < 10) {
      errors.address = "Please enter a complete address";
    }

    if (!shipping.city?.trim()) {
      errors.city = "City name is required";
    } else if (shipping.city.trim().length < 2) {
      errors.city = "Please enter a valid city";
    }

    if (!shipping.state?.trim()) {
      errors.state = "State is required";
    }

    if (!shipping.pinCode?.trim()) {
      errors.pinCode = "PIN code is required";
    } else if (!/^\d{6}$/.test(shipping.pinCode.replace(/\D/g, ""))) {
      errors.pinCode = "PIN code must be exactly 6 digits";
    }

    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // ============================================================================
  // COUPON FUNCTIONS
  // ============================================================================

  function applyCoupon() {
    const upperCode = couponCode.toUpperCase();

    if (!couponCode.trim()) {
      showNotification("Please enter a coupon code", "error");
      return;
    }

    const coupons = {
      "SAVE10": 10,
      "SAVE20": 20,
      "WELCOME": 15,
      "FARMFRESH": 25
    };

    if (coupons[upperCode]) {
      setDiscountPercent(coupons[upperCode]);
      setCouponApplied(true);
      showNotification(`Coupon applied! ${coupons[upperCode]}% discount`, "success");
    } else {
      showNotification("Invalid coupon code", "error");
      setDiscountPercent(0);
      setCouponApplied(false);
    }
  }

  function removeCoupon() {
    setCouponCode("");
    setCouponApplied(false);
    setDiscountPercent(0);
    showNotification("Coupon removed", "info");
  }

  function showNotification(message, type = "success") {
    setNotification(message);
    setNotificationType(type);
    setTimeout(() => setNotification(""), 3000);
  }

  // ============================================================================
  // ORDER FUNCTIONS
  // ============================================================================

  async function handlePlaceOrder(e) {
    e.preventDefault();

    if (!validateShipping()) {
      showNotification("Please fix the errors in your shipping address", "error");
      return;
    }

    setLoading(true);

    try {
      // ✅ Build order payload for backend
      const orderPayload = {
        userEmail: user?.email,
        shipping: {
          fullName: shipping.fullName,
          phone: shipping.phone,
          address: shipping.address,
          city: shipping.city,
          state: shipping.state,
          pinCode: shipping.pinCode,
        }
      };

      const res = await fetch("https://fsad-farmconnect-backend-1.onrender.com/orders/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to place order");
      }

      const order = await res.json();
      const orderId = `ORD-${order.id}`;
      setOrderNumber(orderId);
      setOrderPlaced(true);
      setStep(3);
      showNotification("Order placed successfully!", "success");

      // Clear cart state
      setTimeout(() => {
        clearCart();
        setCouponCode("");
        setCouponApplied(false);
        setDiscountPercent(0);
      }, 1500);

    } catch (error) {
      console.error("Error placing order:", error);
      showNotification(error.message || "Failed to place order. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleShippingChange(e) {
    const { name, value } = e.target;
    setShipping(prev => ({ ...prev, [name]: value }));

    if (shippingErrors[name]) {
      setShippingErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }

  function handleClearCart() {
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      clearCart();
      setCouponCode("");
      setCouponApplied(false);
      setDiscountPercent(0);
      showNotification("Cart cleared", "info");
    }
  }

  // ✅ FIX: Use updateCartQty from context
  function handleQuantityChange(itemId, newQuantity) {
    const item = cartItems.find(i => i.id === itemId);
    const maxStock = item?.stock || 999;

    if (newQuantity < 1) {
      removeFromCart(itemId);
      showNotification("Item removed from cart", "info");
    } else if (newQuantity > maxStock) {
      showNotification(`Maximum stock available is ${maxStock}`, "error");
    } else {
      updateCartQty(itemId, newQuantity);
    }
  }

  function handleRemoveItem(itemId, itemName) {
    removeFromCart(itemId);
    showNotification(`${itemName} removed from cart`, "info");
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 shadow-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <button
              onClick={() => navigate("/buyer-dashboard")}
              className="flex items-center gap-2 hover:bg-white/20 px-4 py-2 rounded-lg transition"
            >
              <FiArrowLeft size={20} /> Back to Shopping
            </button>

            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold">🛒 Shopping Cart</h1>
              <p className="text-indigo-100 text-sm mt-1">Step {step} of 3</p>
            </div>

            <div className="text-right">
              <p className="text-indigo-100 text-sm">Hello,</p>
              <p className="text-lg font-bold">{user?.name || "Buyer"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className={`fixed top-24 left-4 right-4 md:left-auto md:right-6 md:w-96 rounded-lg shadow-2xl p-4 font-semibold flex items-center gap-2 z-40 ${
              notificationType === "success" ? "bg-green-100 text-green-800 border-2 border-green-500" :
              notificationType === "error" ? "bg-red-100 text-red-800 border-2 border-red-500" :
              "bg-blue-100 text-blue-800 border-2 border-blue-500"
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {notificationType === "success" && <FiCheck size={20} />}
            {notificationType === "error" && <FiAlertCircle size={20} />}
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Empty Cart */}
        {cartItems.length === 0 ? (
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-6xl mb-6">🛒</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 text-lg mb-8">Start shopping to add items to your cart.</p>
            <button
              onClick={() => navigate("/buyer-dashboard")}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition"
            >
              Continue Shopping
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Items & Shipping */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cart Items */}
              {step >= 1 && (
                <motion.div
                  className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                        Review Your Items
                      </h2>
                      <p className="text-gray-600 mt-2">{summary.itemCount} items ({summary.distinctItems} products)</p>
                    </div>
                    <button
                      onClick={handleClearCart}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition"
                    >
                      <FiTrash2 size={18} /> Clear All
                    </button>
                  </div>

                  {/* ✅ FIX: Display cart items */}
                  {cartItems && cartItems.length > 0 ? (
                    <div className="space-y-4">
                      {cartItems.map((item, index) => (
                        <motion.div
                          key={item.id || index}
                          className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 hover:border-indigo-400 transition"
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                        >
                          <div className="flex flex-col md:flex-row gap-4">
                            {/* Product Image */}
                            {item.image && (
                              <div className="w-full md:w-28 h-28 rounded-xl overflow-hidden border-2 border-gray-300 flex-shrink-0">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover hover:scale-110 transition"
                                  onError={(e) => (e.target.src = "https://via.placeholder.com/120")}
                                />
                              </div>
                            )}

                            {/* Product Details */}
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-gray-800 mb-1">{item.name}</h3>
                              <p className="text-sm text-gray-600 mb-3">By {item.sellerName || "Unknown"}</p>
                              <div className="flex flex-wrap items-center gap-4">
                                <div>
                                  <p className="text-gray-600 text-sm">Price</p>
                                  <p className="text-2xl font-bold text-indigo-600">₹{parseFloat(item.price).toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600 text-sm">Stock</p>
                                  <p className="text-2xl font-bold text-green-600">{item.stock || 999}</p>
                                </div>
                              </div>
                            </div>

                            {/* Quantity & Remove */}
                            <div className="flex flex-col items-end justify-between">
                              {/* Quantity Control */}
                              <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                                <button
                                  onClick={() => handleQuantityChange(item.id, (item.qty || item.quantity) - 1)}
                                  className="px-4 py-3 hover:bg-gray-200 transition font-bold text-lg"
                                >
                                  <FiMinus size={18} />
                                </button>
                                <input
                                  type="number"
                                  value={item.qty || item.quantity}
                                  onChange={e => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                                  className="w-16 text-center border-0 focus:outline-none font-bold text-lg"
                                  min="1"
                                />
                                <button
                                  onClick={() => handleQuantityChange(item.id, (item.qty || item.quantity) + 1)}
                                  className="px-4 py-3 hover:bg-gray-200 transition font-bold text-lg"
                                >
                                  <FiPlus size={18} />
                                </button>
                              </div>

                              {/* Subtotal */}
                              <div className="text-right mt-3">
                                <p className="text-gray-600 text-sm">Subtotal</p>
                                <p className="text-2xl font-bold text-indigo-600">
                                  ₹{(parseFloat(item.price) * (item.qty || item.quantity)).toFixed(2)}
                                </p>
                              </div>

                              {/* Remove Button */}
                              <button
                                onClick={() => handleRemoveItem(item.id, item.name)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 font-bold px-3 py-2 rounded-lg flex items-center gap-1 text-sm transition mt-3"
                              >
                                <FiX size={16} /> Remove
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-lg">No items in cart</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Coupon Section */}
              {step >= 1 && (
                <motion.div
                  className="bg-white rounded-2xl shadow-xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Apply Coupon Code</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon (SAVE10, WELCOME)"
                      disabled={couponApplied}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 disabled:bg-gray-100"
                    />
                    {!couponApplied ? (
                      <button
                        onClick={applyCoupon}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold transition"
                      >
                        Apply
                      </button>
                    ) : (
                      <button
                        onClick={removeCoupon}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {couponApplied && (
                    <p className="text-green-600 font-bold mt-2">✓ Coupon applied! {discountPercent}% discount</p>
                  )}
                </motion.div>
              )}

              {/* Shipping Form */}
              {step >= 2 && (
                <motion.form
                  className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FiMapPin size={28} className="text-indigo-600" />
                    Shipping Address
                  </h2>

                  {/* ===== ADDRESS MODE TOGGLE ===== */}
                  {savedAddresses.length > 0 && (
                    <div className="mb-6">
                      <div className="flex gap-3 mb-5">
                        <button
                          type="button"
                          onClick={() => setAddressMode("saved")}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-bold transition ${
                            addressMode === "saved"
                              ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                              : "border-gray-200 bg-white text-gray-600 hover:border-indigo-300"
                          }`}
                        >
                          <FiHome size={18} />
                          My Saved Addresses
                          <span className="bg-indigo-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {savedAddresses.length}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setAddressMode("manual"); setSelectedSavedAddress(null); }}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-bold transition ${
                            addressMode === "manual"
                              ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                              : "border-gray-200 bg-white text-gray-600 hover:border-indigo-300"
                          }`}
                        >
                          <FiEdit3 size={18} />
                          Enter New Address
                        </button>
                      </div>

                      {/* Saved address cards */}
                      {addressMode === "saved" && (
                        <div className="space-y-3 mb-6">
                          {savedAddresses.map((addr, i) => (
                            <div
                              key={addr.id || i}
                              onClick={() => applySavedAddress(addr)}
                              className={`cursor-pointer rounded-xl border-2 p-4 transition ${
                                selectedSavedAddress === addr.id
                                  ? "border-indigo-500 bg-indigo-50 shadow-md"
                                  : "border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/40"
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-bold text-gray-800">{addr.fullName}</p>
                                  <p className="text-sm text-gray-600 mt-0.5">📞 {addr.mobile}</p>
                                  <p className="text-sm text-gray-600 mt-1">{addr.street}, {addr.city}, {addr.state} — {addr.pincode}</p>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                                  selectedSavedAddress === addr.id
                                    ? "border-indigo-500 bg-indigo-500"
                                    : "border-gray-300"
                                }`}>
                                  {selectedSavedAddress === addr.id && <FiCheck size={14} className="text-white" />}
                                </div>
                              </div>
                            </div>
                          ))}
                          {selectedSavedAddress && (
                            <p className="text-xs text-indigo-600 font-semibold text-center mt-2">
                              ✅ Address auto-filled below. You can still edit any field.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={shipping.fullName}
                        onChange={handleShippingChange}
                        placeholder="John Doe"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                          shippingErrors.fullName
                            ? "border-red-500 focus:ring-2 focus:ring-red-200"
                            : "border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        }`}
                      />
                      {shippingErrors.fullName && (
                        <p className="text-red-600 text-sm mt-1 font-semibold">{shippingErrors.fullName}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-1">
                        <FiMail size={16} /> Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={shipping.email}
                        onChange={handleShippingChange}
                        placeholder="john@example.com"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                          shippingErrors.email
                            ? "border-red-500 focus:ring-2 focus:ring-red-200"
                            : "border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        }`}
                      />
                      {shippingErrors.email && (
                        <p className="text-red-600 text-sm mt-1 font-semibold">{shippingErrors.email}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-1">
                        <FiPhone size={16} /> Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={shipping.phone}
                        onChange={handleShippingChange}
                        placeholder="9876543210"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                          shippingErrors.phone
                            ? "border-red-500 focus:ring-2 focus:ring-red-200"
                            : "border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        }`}
                      />
                      {shippingErrors.phone && (
                        <p className="text-red-600 text-sm mt-1 font-semibold">{shippingErrors.phone}</p>
                      )}
                    </div>

                    {/* PIN Code */}
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">PIN Code *</label>
                      <input
                        type="text"
                        name="pinCode"
                        value={shipping.pinCode}
                        onChange={handleShippingChange}
                        placeholder="110001"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                          shippingErrors.pinCode
                            ? "border-red-500 focus:ring-2 focus:ring-red-200"
                            : "border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        }`}
                      />
                      {shippingErrors.pinCode && (
                        <p className="text-red-600 text-sm mt-1 font-semibold">{shippingErrors.pinCode}</p>
                      )}
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-800 mb-2">Address *</label>
                      <textarea
                        name="address"
                        value={shipping.address}
                        onChange={handleShippingChange}
                        placeholder="123 Main Street, Apartment 4B"
                        rows="3"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition resize-none ${
                          shippingErrors.address
                            ? "border-red-500 focus:ring-2 focus:ring-red-200"
                            : "border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        }`}
                      />
                      {shippingErrors.address && (
                        <p className="text-red-600 text-sm mt-1 font-semibold">{shippingErrors.address}</p>
                      )}
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={shipping.city}
                        onChange={handleShippingChange}
                        placeholder="New York"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                          shippingErrors.city
                            ? "border-red-500 focus:ring-2 focus:ring-red-200"
                            : "border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        }`}
                      />
                      {shippingErrors.city && (
                        <p className="text-red-600 text-sm mt-1 font-semibold">{shippingErrors.city}</p>
                      )}
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">State *</label>
                      <input
                        type="text"
                        name="state"
                        value={shipping.state}
                        onChange={handleShippingChange}
                        placeholder="NY"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
                          shippingErrors.state
                            ? "border-red-500 focus:ring-2 focus:ring-red-200"
                            : "border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        }`}
                      />
                      {shippingErrors.state && (
                        <p className="text-red-600 text-sm mt-1 font-semibold">{shippingErrors.state}</p>
                      )}
                    </div>
                  </div>
                </motion.form>
              )}
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                className="bg-white rounded-2xl shadow-xl p-6 md:p-8 sticky top-24"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2">
                  <FiCreditCard size={28} className="text-indigo-600" />
                  Order Summary
                </h3>

                {/* Summary Details */}
                <div className="space-y-5 pb-6 border-b-2 border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-semibold">Subtotal:</span>
                    <span className="font-bold text-gray-800">₹{summary.subtotal}</span>
                  </div>

                  {couponApplied && (
                    <div className="flex justify-between text-green-700 font-bold">
                      <span>Discount ({discountPercent}%):</span>
                      <span>-₹{summary.discountAmount}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-700 font-semibold flex items-center gap-1">
                      <FiTruck size={18} /> Shipping:
                    </span>
                    <span className="font-bold">
                      {summary.shippingCost === 0 ? (
                        <span className="text-green-600">FREE ✓</span>
                      ) : (
                        <span className="text-gray-800">₹{summary.shippingCost}</span>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-700 font-semibold">Tax ({summary.taxPercent}%):</span>
                    <span className="font-bold text-gray-800">₹{summary.tax}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center py-6 mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-4 rounded-xl">
                  <span className="text-xl font-bold text-gray-800">Total:</span>
                  <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                    ₹{summary.total}
                  </span>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => {
                    if (step === 1) setStep(2);
                    else if (step === 2) handlePlaceOrder(new Event("submit"));
                  }}
                  disabled={loading || orderPlaced || cartItems.length === 0}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : step === 1 ? (
                    <>
                      <FiArrowLeft size={20} /> Continue to Shipping
                    </>
                  ) : orderPlaced ? (
                    <>
                      <FiCheck size={20} /> Order Placed!
                    </>
                  ) : (
                    <>
                      <FiCheck size={20} /> Place Order
                    </>
                  )}
                </button>

                {/* Back Button */}
                {step === 2 && (
                  <button
                    onClick={() => setStep(1)}
                    className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-xl font-bold transition"
                  >
                    Back to Cart
                  </button>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </div>

      {/* Order Confirmation Modal */}
      <AnimatePresence>
        {orderPlaced && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="bg-gradient-to-br from-green-100 to-green-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6"
              >
                <FiCheck className="text-green-600" size={80} />
              </motion.div>

              <h2 className="text-3xl font-bold text-gray-800 mb-3">Order Placed! ✓</h2>
              <p className="text-gray-600 mb-2 text-lg">Thank you for your order!</p>
              <p className="text-gray-600 mb-6">Check your email for confirmation.</p>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-8 border-2 border-indigo-200">
                <p className="text-gray-600 text-sm font-semibold mb-1">Order Number</p>
                <p className="text-2xl font-bold text-indigo-600 font-mono break-all">{orderNumber}</p>
              </div>

              <button
                onClick={() => navigate("/buyer-dashboard")}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl"
              >
                Continue Shopping
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
