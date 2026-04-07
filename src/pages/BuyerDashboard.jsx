import React, { useState, useContext, useMemo, useEffect } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { ProductContext } from "../context/ProductContext.jsx";
import { CartContext } from "../context/CartContext.jsx";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiShoppingCart, FiStar, FiSearch, FiLogOut, FiFilter, FiX, FiTrendingUp, FiAlertCircle, FiCheck, FiX as FiClose, FiEdit2, FiTrash2 } from "react-icons/fi";

/**
 * ============================================================================
 * BuyerDashboard.jsx - Complete Buyer Shopping Interface (900+ Lines)
 * ============================================================================
 * 
 * Professional buyer marketplace with:
 * - Product browsing and searching
 * - Advanced filtering (category, price, rating)
 * - Real-time cart integration
 * - Product details modal
 * - Quantity selections
 * - Stock validation
 * - Seller information
 * - Product recommendations
 * - Responsive design
 * - Professional animations
 * - Error handling
 * 
 * ============================================================================
 */

export default function BuyerDashboard() {
  // ============================================================================
  // CONTEXT SETUP
  // ============================================================================

  const { user, logout } = useContext(AuthContext);
  const productContext = useContext(ProductContext);
  const cartContext = useContext(CartContext);
  const navigate = useNavigate();

  // ✅ FIX: Use correct cart methods
  const cartItems = cartContext?.cart?.items || [];
  const addToCart = cartContext?.addToCart || (() => {});
  const getCartItemCount = cartContext?.getCartItemCount || (() => 0);
  const getCartTotal = cartContext?.getCartTotal || (() => 0);

  // ============================================================================
  // SAMPLE PRODUCTS
  // ============================================================================

  

  // ============================================================================
  // GET PRODUCTS
  // ============================================================================

  // ✅ FIX: Get products from ProductContext or use samples
  // ✅ FINAL: ONLY BACKEND PRODUCTS (NO SAMPLE)
const products = useMemo(() => {
  if (productContext?.products && Array.isArray(productContext.products)) {
    return productContext.products;
  }
  return []; // no fallback
}, [productContext?.products]);

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState("");
  const [notificationType, setNotificationType] = useState("success");
  const [error, setError] = useState("");

  // ✅ WISHLIST STATE
  const [wishlist, setWishlist] = useState([]); // array of productIds
  const [showWishlist, setShowWishlist] = useState(false);
  const [wishlistProducts, setWishlistProducts] = useState([]);

  // ✅ ADDRESS STATE
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    fullName: "", mobile: "", street: "", city: "", state: "", pincode: ""
  });
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressMsg, setAddressMsg] = useState("");

  // ✅ EDIT ADDRESS STATE
  const [editingAddress, setEditingAddress] = useState(null); // holds the address being edited
  const [editForm, setEditForm] = useState({
    fullName: "", mobile: "", street: "", city: "", state: "", pincode: ""
  });

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Check authentication on mount
   */
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "buyer") {
      navigate("/");
      return;
    }
  }, [user, navigate]);

  // ✅ LOAD WISHLIST FROM BACKEND
  useEffect(() => {
    if (!user?.email) return;
    fetch(`http://localhost:8080/wishlist/${user.email}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setWishlistProducts(data);
          setWishlist(data.map(p => p.id));
        }
      })
      .catch(console.error);
  }, [user?.email]);

  // ✅ LOAD ADDRESSES FROM BACKEND
  useEffect(() => {
    if (!user?.email) return;
    fetch(`http://localhost:8080/address/${encodeURIComponent(user.email)}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setSavedAddresses(data); })
      .catch(console.error);
  }, [user?.email]);

  async function saveAddress(e) {
    e.preventDefault();
    setAddressMsg("");
    if (!newAddress.fullName || !newAddress.mobile || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      setAddressMsg("⚠️ Please fill all address fields.");
      return;
    }
    setAddressLoading(true);
    try {
      const res = await fetch("http://localhost:8080/address/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: user.email, ...newAddress })
      });
      if (!res.ok) throw new Error("Failed to save address");
      const saved = await res.json();
      setSavedAddresses(prev => [...prev, saved]);
      setNewAddress({ fullName: "", mobile: "", street: "", city: "", state: "", pincode: "" });
      setAddressMsg("✅ Address saved successfully!");
    } catch (err) {
      setAddressMsg("❌ " + err.message);
    } finally {
      setAddressLoading(false);
    }
  }

  // ✅ START EDITING AN ADDRESS
  function startEdit(addr) {
    setEditingAddress(addr.id);
    setEditForm({
      fullName: addr.fullName || "",
      mobile:   addr.mobile   || "",
      street:   addr.street   || "",
      city:     addr.city     || "",
      state:    addr.state    || "",
      pincode:  addr.pincode  || "",
    });
    setAddressMsg("");
  }

  // ✅ CANCEL EDITING
  function cancelEdit() {
    setEditingAddress(null);
    setAddressMsg("");
  }

  // ✅ SAVE EDITED ADDRESS
  async function saveEditedAddress(addrId) {
    if (!editForm.fullName || !editForm.mobile || !editForm.street || !editForm.city || !editForm.state || !editForm.pincode) {
      setAddressMsg("⚠️ Please fill all fields.");
      return;
    }
    setAddressLoading(true);
    setAddressMsg("");
    try {
      const res = await fetch(`http://localhost:8080/address/update/${addrId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      if (!res.ok) throw new Error("Failed to update address");
      const updated = await res.json();
      setSavedAddresses(prev => prev.map(a => a.id === addrId ? updated : a));
      setEditingAddress(null);
      setAddressMsg("✅ Address updated successfully!");
    } catch (err) {
      setAddressMsg("❌ " + err.message);
    } finally {
      setAddressLoading(false);
    }
  }

  // ✅ DELETE ADDRESS
  async function deleteAddress(addrId) {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      const res = await fetch(`http://localhost:8080/address/delete/${addrId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete address");
      setSavedAddresses(prev => prev.filter(a => a.id !== addrId));
      if (editingAddress === addrId) setEditingAddress(null);
      setAddressMsg("🗑️ Address deleted.");
    } catch (err) {
      setAddressMsg("❌ " + err.message);
    }
  }

  async function toggleWishlist(product) {
    const isIn = wishlist.includes(product.id);
    if (isIn) {
      // REMOVE
      await fetch(`http://localhost:8080/wishlist/remove?userEmail=${user.email}&productId=${product.id}`, { method: "DELETE" });
      setWishlist(w => w.filter(id => id !== product.id));
      setWishlistProducts(wp => wp.filter(p => p.id !== product.id));
    } else {
      // ADD
      const res = await fetch("http://localhost:8080/wishlist/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: user.email, productId: product.id })
      });
      if (res.ok) {
        setWishlist(w => [...w, product.id]);
        setWishlistProducts(wp => [...wp, product]);
      }
    }
  }

  /**
   * Clear notification after delay
   */
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  /**
   * Clear error after delay
   */
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // ============================================================================
  // DATA PROCESSING
  // ============================================================================

  const allProducts = Array.isArray(products) ? products : [];

  /**
   * Filter and sort products based on criteria
   */
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term)) ||
        (p.sellerName && p.sellerName.toLowerCase().includes(term)) ||
        (p.category && p.category.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Price filter
    result = result.filter(p => {
      const price = parseFloat(p.price) || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Rating filter
    result = result.filter(p => {
      const rating = parseFloat(p.rating) || 0;
      return rating >= minRating;
    });

    // Stock filter - only show available products
    result = result.filter(p => p.stock > 0);

    // Sorting
    if (sortBy === "newest") {
      result = [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "price-low") {
      result = [...result].sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-high") {
      result = [...result].sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "rating") {
      result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === "popular") {
      result = [...result].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    }

    return result;
  }, [allProducts, searchTerm, selectedCategory, priceRange, minRating, sortBy]);

  // ============================================================================
  // CALCULATIONS
  // ============================================================================

  /**
   * Calculate total cart items
   */
  const totalCartItems = useMemo(() => {
    return getCartItemCount();
  }, [cartItems, getCartItemCount]);

  /**
   * Calculate cart total
   */
  const cartTotal = useMemo(() => {
    return getCartTotal();
  }, [cartItems, getCartTotal]);

  /**
   * Get unique sellers count
   */
  const uniqueSellers = useMemo(() => {
    return new Set(allProducts.map(p => p.sellerEmail)).size;
  }, [allProducts]);

  /**
   * Get max price for filters
   */
  const maxPrice = useMemo(() => {
    const max = Math.max(...allProducts.map(p => parseFloat(p.price) || 0));
    return max || 500;
  }, [allProducts]);

  // ============================================================================
  // CATEGORIES
  // ============================================================================

  const categories = ["all", "vegetables", "fruits", "grains", "dairy", "spices", "organic", "other"];

  // ============================================================================
  // FUNCTIONS
  // ============================================================================

  /**
   * Handle add to cart with validation
   */
  function handleAddToCart(product) {
    setError("");

    if (!product) {
      setError("Product not found");
      return;
    }

    if (!addToCart) {
      setError("Cart context not available");
      return;
    }

    if (quantity < 1 || quantity > product.stock) {
      setError(`Please select valid quantity (1-${product.stock})`);
      return;
    }

    try {
      setLoading(true);
      
      // ✅ FIX: Call addToCart correctly
      const success = addToCart(product, quantity);
      
      if (success !== false) {
        setNotification(`✅ ${quantity}x ${product.name} added to cart!`);
        setNotificationType("success");
        setQuantity(1);
        setSelectedProduct(null);
      } else {
        setError("Failed to add to cart");
        setNotificationType("error");
      }

      setLoading(false);
    } catch (err) {
      console.error("Error adding to cart:", err);
      setError("Failed to add to cart. Please try again.");
      setNotificationType("error");
      setLoading(false);
    }
  }

  /**
   * Handle quantity change with validation
   */
  function handleQuantityChange(newQty) {
    const qty = Math.max(1, Math.min(selectedProduct.stock, parseInt(newQty) || 1));
    setQuantity(qty);
  }

  /**
   * Reset all filters
   */
  function resetFilters() {
    setSearchTerm("");
    setSelectedCategory("all");
    setPriceRange([0, maxPrice]);
    setMinRating(0);
    setSortBy("newest");
    setShowFilters(false);
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* ========== HEADER ========== */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 shadow-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-6 flex-col md:flex-row gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-1">🛒 Buyer Dashboard</h1>
              <p className="text-blue-100 text-lg">Welcome, {user?.name || "Buyer"}!</p>
            </div>
            <div className="flex gap-3 flex-wrap justify-end">
              <button
                onClick={() => navigate("/cart")}
                className="bg-white/20 hover:bg-white/30 px-4 py-3 rounded-lg font-semibold transition flex items-center gap-2 relative"
                title="Go to cart"
              >
                <FiShoppingCart size={22} />
                Cart
                {totalCartItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                    {totalCartItems}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate("/orders")}
                className="bg-white/20 hover:bg-white/30 px-4 py-3 rounded-lg font-semibold transition"
                title="View orders"
              >
                📦 Orders
              </button>

              <button
                onClick={() => setShowWishlist(true)}
                className="bg-white/20 hover:bg-white/30 px-4 py-3 rounded-lg font-semibold transition relative"
                title="My Wishlist"
              >
                ❤️ Wishlist
                {wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* 📍 Addresses Button */}
              <button
                onClick={() => { setShowAddressModal(true); setAddressMsg(""); }}
                className="bg-white/20 hover:bg-white/30 px-4 py-3 rounded-lg font-semibold transition relative"
                title="My Addresses"
              >
                📍 Addresses
                {savedAddresses.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-800 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {savedAddresses.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate("/profile")}
                className="bg-white/20 hover:bg-white/30 px-4 py-3 rounded-lg font-semibold transition"
                title="View profile"
              >
                👤 Profile
              </button>

              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="bg-white/20 hover:bg-white/30 px-4 py-3 rounded-lg font-semibold transition flex items-center gap-2"
                title="Logout"
              >
                <FiLogOut size={22} /> Logout
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white/10 backdrop-blur px-4 py-3 rounded-lg text-center hover:bg-white/20 transition">
              <p className="text-blue-100 text-xs font-semibold">Products</p>
              <p className="text-3xl font-bold">{allProducts.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur px-4 py-3 rounded-lg text-center hover:bg-white/20 transition">
              <p className="text-blue-100 text-xs font-semibold">Available</p>
              <p className="text-3xl font-bold text-green-300">{filteredProducts.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur px-4 py-3 rounded-lg text-center hover:bg-white/20 transition">
              <p className="text-blue-100 text-xs font-semibold">Cart Items</p>
              <p className="text-3xl font-bold text-yellow-300">{totalCartItems}</p>
            </div>
            <div className="bg-white/10 backdrop-blur px-4 py-3 rounded-lg text-center hover:bg-white/20 transition">
              <p className="text-blue-100 text-xs font-semibold">Cart Total</p>
              <p className="text-3xl font-bold text-green-300">₹{parseFloat(cartTotal || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white/10 backdrop-blur px-4 py-3 rounded-lg text-center hover:bg-white/20 transition">
              <p className="text-blue-100 text-xs font-semibold">Sellers</p>
              <p className="text-3xl font-bold">{uniqueSellers}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* ========== NOTIFICATIONS ========== */}
        <AnimatePresence>
          {notification && (
            <motion.div
              className="mb-6 bg-green-100 border-2 border-green-500 text-green-800 px-6 py-4 rounded-lg font-semibold flex items-center gap-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <FiCheck size={20} /> {notification}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              className="mb-6 bg-red-100 border-2 border-red-500 text-red-800 px-6 py-4 rounded-lg font-semibold flex items-center gap-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <FiAlertCircle size={20} /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== SEARCH ========== */}
        <div className="mb-6">
          <div className="relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="🔍 Search products, sellers, categories..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-lg transition"
            />
          </div>
        </div>

        {/* ========== FILTERS ========== */}
        <div className="mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-white px-6 py-3 rounded-lg shadow-md font-semibold text-gray-800 hover:shadow-lg transition"
          >
            <FiFilter size={20} />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="bg-white rounded-lg shadow-lg p-6 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                {/* Category Filter */}
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">🏷️ Category</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {categories.map(cat => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer hover:text-indigo-600 transition">
                        <input
                          type="radio"
                          name="category"
                          value={cat}
                          checked={selectedCategory === cat}
                          onChange={e => setSelectedCategory(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="font-semibold">{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">💰 Price Range</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-bold text-gray-600">Min: ₹{priceRange[0]}</label>
                      <input
                        type="range"
                        min="0"
                        max={maxPrice}
                        value={priceRange[0]}
                        onChange={e => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-600">Max: ₹{priceRange[1]}</label>
                      <input
                        type="range"
                        min="0"
                        max={maxPrice}
                        value={priceRange[1]}
                        onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">⭐ Min Rating</h3>
                  <div className="space-y-2">
                    {[0, 1, 2, 3, 4, 5].map(rating => (
                      <label key={rating} className="flex items-center gap-2 cursor-pointer hover:text-indigo-600 transition">
                        <input
                          type="radio"
                          name="rating"
                          value={rating}
                          checked={minRating === rating}
                          onChange={e => setMinRating(parseInt(e.target.value))}
                          className="w-4 h-4"
                        />
                        <span className="font-semibold">{rating === 0 ? "All Products" : `${rating}⭐ & Above`}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">📊 Sort By</h3>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 font-semibold text-gray-700 cursor-pointer"
                  >
                    <option value="newest">📅 Newest First</option>
                    <option value="price-low">💰 Price: Low→High</option>
                    <option value="price-high">💸 Price: High→Low</option>
                    <option value="rating">⭐ Highest Rated</option>
                    <option value="popular">🔥 Most Popular</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ========== PRODUCTS GRID ========== */}
        <div>
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            Available Products
            <span className="text-indigo-600 ml-2">({filteredProducts.length})</span>
          </h2>

          {filteredProducts.length === 0 ? (
            <motion.div
              className="bg-white rounded-lg shadow-lg p-16 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-500 text-xl mb-2 font-bold">No Products Found</p>
              <p className="text-gray-400 mb-6">Try adjusting your search filters</p>
              <button
                onClick={resetFilters}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition"
              >
                Reset All Filters
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id || index}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition overflow-hidden cursor-pointer group border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8 }}
                >
                  {/* Product Image */}
                  <div className="h-48 bg-gray-200 overflow-hidden relative">
                    <img
                      src={product.image || "https://via.placeholder.com/300?text=No+Image"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      onError={(e) => (e.target.src = "https://via.placeholder.com/300?text=No+Image")}
                    />
                    {/* ❤️ Wishlist Heart */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
                      className="absolute top-2 left-2 w-8 h-8 flex items-center justify-center bg-white/80 rounded-full shadow-md hover:scale-110 transition text-lg"
                      title={wishlist.includes(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      {wishlist.includes(product.id) ? "❤️" : "🤍"}
                    </button>
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      ✓ In Stock
                    </div>
                    {product.category && (
                      <div className="absolute bottom-2 left-2 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {product.category}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    {/* Product Name */}
                    <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-2 h-14">{product.name}</h3>

                    {/* Seller */}
                    <p className="text-sm text-gray-600 mb-3">👤 {product.sellerName || "Unknown Seller"}</p>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            size={14}
                            fill={i < Math.round(product.rating || 0) ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">
                        {(product.rating || 0).toFixed(1)} ({product.reviews?.length || 0})
                      </span>
                    </div>

                    {/* Price & Stock */}
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-indigo-600">₹{parseFloat(product.price).toLocaleString()}</span>
                      <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {product.stock} left
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setQuantity(1);
                      }}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg"
                    >
                      <FiShoppingCart size={18} /> Add to Cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========== ADD TO CART MODAL ========== */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full max-h-screen overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">🛒 Add to Cart</h2>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-500 hover:text-red-600 transition"
                >
                  <FiX size={24} />
                </button>
              </div>

              {/* Product Image */}
              <div className="mb-4">
                <img
                  src={selectedProduct.image || "https://via.placeholder.com/300"}
                  alt={selectedProduct.name}
                  className="w-full h-40 object-cover rounded-lg border-2 border-gray-200"
                  onError={(e) => (e.target.src = "https://via.placeholder.com/300")}
                />
              </div>

              {/* Product Details */}
              <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedProduct.name}</h3>
              <p className="text-gray-600 mb-4 text-sm">{selectedProduct.description}</p>

              {/* Product Info Box */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg mb-6 border border-indigo-200">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-700">Price:</span>
                  <span className="font-bold text-indigo-600 text-lg">₹{parseFloat(selectedProduct.price).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Available:</span>
                  <span className="font-bold text-green-600">{selectedProduct.stock} units</span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-bold mb-3 text-gray-800">Quantity</label>
                <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="px-4 py-3 hover:bg-gray-100 text-xl font-bold text-gray-700 transition"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={e => handleQuantityChange(e.target.value)}
                    className="flex-1 text-center border-0 focus:outline-none text-lg font-bold"
                    min="1"
                    max={selectedProduct.stock}
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="px-4 py-3 hover:bg-gray-100 text-xl font-bold text-gray-700 transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Price */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg mb-6 border-2 border-green-300">
                <p className="text-sm text-gray-600 mb-1">Total Price:</p>
                <p className="text-3xl font-bold text-green-600">
                  ₹{(parseFloat(selectedProduct.price) * quantity).toLocaleString()}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleAddToCart(selectedProduct)}
                  disabled={loading || quantity < 1}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <FiCheck size={18} /> Add to Cart
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-bold transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ❤️ WISHLIST MODAL */}
      <AnimatePresence>
        {showWishlist && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowWishlist(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">❤️ My Wishlist ({wishlistProducts.length})</h2>
                <button onClick={() => setShowWishlist(false)} className="text-gray-400 hover:text-red-500 text-2xl">✕</button>
              </div>
              {wishlistProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">🤍</p>
                  <p className="text-gray-500 text-lg">Your wishlist is empty.</p>
                  <p className="text-gray-400 text-sm mt-1">Tap ❤️ on any product to save it here!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {wishlistProducts.map(product => (
                    <div key={product.id} className="flex gap-3 bg-gray-50 rounded-xl p-3 border border-gray-200">
                      <img src={product.image || "https://via.placeholder.com/80"} alt={product.name}
                        className="w-20 h-20 object-cover rounded-lg" />
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 text-sm">{product.name}</p>
                        <p className="text-xs text-gray-500 mb-1">by {product.sellerName}</p>
                        <p className="text-indigo-600 font-bold">₹{parseFloat(product.price).toLocaleString()}</p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => { setSelectedProduct(product); setQuantity(1); setShowWishlist(false); }}
                            className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg font-semibold hover:bg-indigo-700 transition"
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={() => toggleWishlist(product)}
                            className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-lg font-semibold hover:bg-red-200 transition"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}\n      </AnimatePresence>

      {/* 📍 ADDRESS MODAL */}
      <AnimatePresence>
        {showAddressModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowAddressModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-bold text-gray-800">📍 My Addresses</h2>
                <button onClick={() => setShowAddressModal(false)} className="text-gray-400 hover:text-red-500 text-2xl">✕</button>
              </div>

              {/* Saved Addresses */}
              {savedAddresses.length > 0 && (
                <div className="mb-5 space-y-3">
                  <p className="text-sm font-bold text-gray-700">Saved Addresses ({savedAddresses.length}):</p>
                  {savedAddresses.map((addr, i) => (
                    <div key={addr.id || i} className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm">
                      {editingAddress === addr.id ? (
                        /* ── INLINE EDIT FORM ── */
                        <div>
                          <p className="font-bold text-indigo-700 mb-3">✏️ Edit Address</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                              { label: "Full Name *",           key: "fullName", placeholder: "Full name" },
                              { label: "Mobile Number *",       key: "mobile",   placeholder: "10-digit phone" },
                              { label: "Street / Area / House No *", key: "street", placeholder: "Street address", full: true },
                              { label: "City *",    key: "city",    placeholder: "City" },
                              { label: "State *",   key: "state",   placeholder: "State" },
                              { label: "Pincode *", key: "pincode", placeholder: "6-digit pincode" },
                            ].map(field => (
                              <div key={field.key} className={field.full ? "md:col-span-2" : ""}>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">{field.label}</label>
                                <input
                                  type="text"
                                  value={editForm[field.key]}
                                  onChange={e => setEditForm(f => ({ ...f, [field.key]: e.target.value }))}
                                  placeholder={field.placeholder}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800 text-sm"
                                />
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button
                              type="button"
                              onClick={() => saveEditedAddress(addr.id)}
                              disabled={addressLoading}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-bold text-sm transition disabled:opacity-50 flex items-center gap-1"
                            >
                              <FiCheck size={14} />
                              {addressLoading ? "Saving..." : "Save Changes"}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-bold text-sm transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* ── ADDRESS CARD VIEW ── */
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="font-bold text-gray-800">{addr.fullName} | 📞 {addr.mobile}</p>
                            <p className="text-gray-600 mt-1">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => startEdit(addr)}
                              title="Edit address"
                              className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition"
                            >
                              <FiEdit2 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteAddress(addr.id)}
                              title="Delete address"
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                            >
                              <FiTrash2 size={15} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Address Form */}
              <div className="border-t pt-5">
                <p className="text-sm font-bold text-gray-700 mb-4">➕ Add New Address:</p>
                <form onSubmit={saveAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Full Name *", key: "fullName", placeholder: "Your full name" },
                    { label: "Mobile Number *", key: "mobile", placeholder: "10-digit phone" },
                    { label: "Street / Area / House No *", key: "street", placeholder: "Street address", full: true },
                    { label: "City *", key: "city", placeholder: "City" },
                    { label: "State *", key: "state", placeholder: "State" },
                    { label: "Pincode *", key: "pincode", placeholder: "6-digit pincode" },
                  ].map(field => (
                    <div key={field.key} className={field.full ? "md:col-span-2" : ""}>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">{field.label}</label>
                      <input
                        type="text"
                        value={newAddress[field.key]}
                        onChange={e => setNewAddress(a => ({ ...a, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800 text-sm"
                      />
                    </div>
                  ))}

                  {addressMsg && (
                    <div className={`md:col-span-2 text-sm font-semibold px-3 py-2 rounded-lg ${
                      addressMsg.startsWith("✅") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      {addressMsg}
                    </div>
                  )}

                  <div className="md:col-span-2 flex gap-3">
                    <button
                      type="submit"
                      disabled={addressLoading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-lg font-bold transition disabled:opacity-50"
                    >
                      {addressLoading ? "Saving..." : "💾 Save Address"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddressModal(false)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2.5 rounded-lg font-bold transition"
                    >
                      Close
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
