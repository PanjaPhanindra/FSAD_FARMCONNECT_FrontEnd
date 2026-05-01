import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useProducts } from "../context/ProductContext.jsx";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiTrash2, FiEdit2, FiLogOut, FiUpload, FiX } from "react-icons/fi";

export default function SellerDashboard() {
  const { user, logout } = useContext(AuthContext);

  
const { getProductsBySeller, addProduct, deleteProduct, updateProduct } = useProducts();
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "vegetables",
    image: null
  });

  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [sellerProducts, setSellerProducts] = useState([]);

  // ✅ SELLER ORDERS STATE
  const [sellerOrders, setSellerOrders] = useState([]);
  const [showOrders, setShowOrders] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // ✅ FIXED FETCH
  const loadProducts = () => {
    if (user?.email) {
      getProductsBySeller(user.email).then(data => {
        setSellerProducts(data || []);
      });
    }
  };

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, [user]);

  const loadOrders = () => {
    if (!user?.email) return;
    fetch(`https://fsad-farmconnect-backend-1.onrender.com/orders/seller/${user.email}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setSellerOrders(data); })
      .catch(console.error);
  };

  async function updateOrderStatus(orderId, newStatus) {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`https://fsad-farmconnect-backend-1.onrender.com/orders/${orderId}/status?status=${newStatus}`, { method: "PUT" });
      if (res.ok) loadOrders();
    } catch (e) { console.error(e); }
    setUpdatingOrderId(null);
  }

  // FILTER
  const filteredProducts = sellerProducts
    .filter(p => {
      const categoryMatch = filterCategory === "all" || p.category === filterCategory;
const searchMatch = (p.name || "").toLowerCase().includes(searchTerm.toLowerCase());      return categoryMatch && searchMatch;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "stock") return b.stock - a.stock;
      return 0;
    });

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(f => ({ ...f, image: reader.result }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please select a valid image file");
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setDragActive(false);
  }

  function handleDropImage(e) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(f => ({ ...f, image: reader.result }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  function validateForm() {
    if (!formData.name.trim()) return alert("Product name required"), false;
    if (!formData.price || parseFloat(formData.price) <= 0) return alert("Valid price required"), false;
    if (!formData.stock || parseInt(formData.stock) < 0) return alert("Valid stock required"), false;
    if (!formData.image && !editingId) return alert("Image required"), false;
    return true;
  }

  // ✅ FIXED SUBMIT
  async function handleSubmit(e) {
  e.preventDefault();
  if (!validateForm()) return;

  try {
    // ✅ EDIT MODE
    if (editingId) {
      await updateProduct(editingId, {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        image: formData.image,
        sellerEmail: user?.email,
        sellerName: user?.name
      });
    } else {
      // ✅ ADD MODE
      await addProduct({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        image: formData.image,
        sellerEmail: user?.email,
        sellerName: user?.name
      });
    }

    loadProducts();

    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "vegetables",
      image: null
    });

    setImagePreview(null);
    setShowForm(false);
  } catch (err) {
    alert("Failed to save product. If your image is very large, try a smaller one, or check server logs.");
  }
}

  // ✅ FIXED DELETE
  async function handleDelete(productId) {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(productId);
      loadProducts(); // 🔥 refresh
    }
  }

  function handleEdit(product) {
    setFormData({
      name: product.name,
      description: product.description,
      price: String(product.price),
stock: String(product.stock),
      category: product.category,
      image: product.image
    });
    setImagePreview(product.image);
    setEditingId(product.id);
    setShowForm(true);
  }

  const totalInventoryValue = sellerProducts.reduce(
    (sum, p) => sum + (p.price * p.stock),
    0
  );

  const totalSold = sellerProducts.reduce(
    (sum, p) => sum + (p.soldCount || 0),
    0
  );

  const avgRating = sellerProducts.length > 0
    ? (sellerProducts.reduce((sum, p) => sum + (p.rating || 0), 0) / sellerProducts.length).toFixed(1)
    : 0;

  const categories = ["all", "vegetables", "fruits", "grains", "dairy", "other"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header with seller info */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-1">Seller Dashboard</h1>
              <p className="text-green-100 text-lg">Welcome, {user?.name || "Seller"}</p>
              <p className="text-green-100 text-sm">{user?.email}</p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
            >
              <FiLogOut size={20} /> Logout
            </button>
            <button
              onClick={() => setShowOrders(v => !v)}
              className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${showOrders ? "bg-white text-green-700 shadow" : "bg-white/20 hover:bg-white/30"}`}
            >
              📦 Orders {sellerOrders.length > 0 && `(${sellerOrders.length})`}
            </button>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-white/10 backdrop-blur p-4 rounded-lg">
              <p className="text-green-100 text-sm">Total Products</p>
              <p className="text-3xl font-bold">{sellerProducts.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur p-4 rounded-lg">
              <p className="text-green-100 text-sm">Total Sold</p>
              <p className="text-3xl font-bold">{totalSold}</p>
            </div>
            <div className="bg-white/10 backdrop-blur p-4 rounded-lg">
              <p className="text-green-100 text-sm">Avg Rating</p>
              <p className="text-3xl font-bold">{avgRating}⭐</p>
            </div>
            <div className="bg-white/10 backdrop-blur p-4 rounded-lg">
              <p className="text-green-100 text-sm">Inventory Value</p>
              <p className="text-3xl font-bold">₹{totalInventoryValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Action buttons and controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <motion.button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              if (showForm) {
                setFormData({ name: "", description: "", price: "", stock: "", category: "vegetables", image: null });
                setImagePreview(null);
              }
            }}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:shadow-xl flex items-center gap-2 transition"
            whileHover={{ scale: 1.05 }}
          >
            <FiPlus size={20} /> {editingId ? "Update" : "Add"} Product
          </motion.button>

          {/* Search and filters */}
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              placeholder="🔍 Search products..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="newest">Newest</option>
              <option value="price-high">Price (High)</option>
              <option value="price-low">Price (Low)</option>
              <option value="stock">Stock</option>
            </select>
          </div>
        </div>

        {/* Add/Edit Product Form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow-lg p-8 mb-8 border-l-4 border-green-500"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingId ? "Edit Product" : "Add New Product"}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ name: "", description: "", price: "", stock: "", category: "vegetables", image: null });
                    setImagePreview(null);
                  }}
                  className="text-gray-500 hover:text-red-600"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Product name */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Product Name *</label>
                  <input
                    type="text"
                    placeholder="E.g., Organic Tomatoes"
                    value={formData.name}
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={e => setFormData(f => ({ ...f, price: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Stock Quantity *</label>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={formData.stock}
                    onChange={e => setFormData(f => ({ ...f, stock: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Category *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {categories.filter(c => c !== "all").map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-gray-700">Description</label>
                <textarea
                  placeholder="Describe your product, benefits, harvest date, etc..."
                  value={formData.description}
                  onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="4"
                />
              </div>

              {/* Image upload */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-gray-700">Product Image *</label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDropImage}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                    dragActive
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 hover:border-green-500"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-input"
                  />
                  <label
                    htmlFor="image-input"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <FiUpload size={32} className="text-gray-400" />
                    <p className="font-semibold text-gray-700">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                  </label>
                </div>

                {/* Image preview */}
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-xs h-40 object-cover rounded-lg border border-green-300"
                    />
                  </div>
                )}
              </div>

              {/* Form buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-bold transition shadow-md hover:shadow-lg"
                >
                  {editingId ? "Update Product" : "Add Product"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ name: "", description: "", price: "", stock: "", category: "vegetables", image: null });
                    setImagePreview(null);
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-8 py-3 rounded-lg font-bold transition"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Your Products
            <span className="text-green-600 ml-2">({filteredProducts.length})</span>
          </h2>

          {filteredProducts.length === 0 ? (
            <motion.div
              className="bg-white rounded-lg shadow p-12 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-gray-500 text-lg mb-4">
                {sellerProducts.length === 0
                  ? "No products added yet. Click 'Add Product' to get started!"
                  : "No products match your filters."}
              </p>
              {sellerProducts.length === 0 && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-bold transition"
                >
                  Add Your First Product
                </button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <motion.div
                  key={product.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition border border-gray-200"
                  whileHover={{ y: -8 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Product image */}
                  {product.image && (
                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-110 transition duration-300"
                      />
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {product.category}
                      </div>
                    </div>
                  )}

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>

                    {/* Product stats */}
                    <div className="space-y-3 mb-4 pb-4 border-b">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="text-xl font-bold text-green-600">₹{product.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Stock:</span>
                        <span className={`font-semibold ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                          {product.stock} units
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sold:</span>
                        <span className="font-semibold text-blue-600">{product.soldCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rating:</span>
                        <span className="font-semibold">{product.rating || 0}⭐ ({product.totalRatings || 0})</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                      >
                        <FiEdit2 size={18} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                      >
                        <FiTrash2 size={18} /> Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 📦 SELLER ORDERS SECTION */}
      {showOrders && (
        <div className="max-w-7xl mx-auto p-6 pt-0">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📦 Orders for Your Products ({sellerOrders.length})</h2>
          {sellerOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">No orders yet.</div>
          ) : (
            <div className="space-y-4">
              {sellerOrders.map(order => {
                const myItems = (order.items || []).filter(i => i.sellerEmail === user.email);
                const statusColors = { placed: "bg-blue-100 text-blue-800", processing: "bg-yellow-100 text-yellow-800", shipped: "bg-purple-100 text-purple-800", delivered: "bg-green-100 text-green-800", cancelled: "bg-red-100 text-red-800" };
                const sc = statusColors[order.status] || "bg-gray-100 text-gray-800";
                return (
                  <motion.div key={order.id} className="bg-white rounded-xl shadow-lg p-5 border border-gray-100"
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Order ID</p>
                        <p className="font-bold text-gray-800">ORD-{order.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Buyer</p>
                        <p className="font-semibold text-gray-700">{order.userEmail}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="font-semibold text-gray-700">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${sc}`}>{order.status?.toUpperCase()}</span>
                    </div>

                    {/* Shipping address */}
                    {order.shippingAddress && (
                      <p className="text-xs text-gray-500 mb-3">
                        📍 {order.shippingName} | {order.shippingAddress}, {order.shippingCity}, {order.shippingState} {order.shippingPincode}
                      </p>
                    )}

                    {/* My items in this order */}
                    <div className="mb-3 space-y-2">
                      {myItems.map(item => (
                        <div key={item.id} className="flex gap-3 items-center bg-gray-50 rounded-lg p-2">
                          {item.productImage && <img src={item.productImage} className="w-12 h-12 object-cover rounded" alt={item.productName} />}
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 text-sm">{item.productName}</p>
                            <p className="text-xs text-gray-500">₹{item.price} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Status update */}
                    {order.status !== "cancelled" && order.status !== "delivered" && (
                      <div className="flex gap-2 flex-wrap">
                        <p className="text-xs font-semibold text-gray-600 self-center">Update Status:</p>
                        {["processing", "shipped", "delivered"].map(st => (
                          <button key={st}
                            disabled={updatingOrderId === order.id || order.status === st}
                            onClick={() => updateOrderStatus(order.id, st)}
                            className={`px-3 py-1 rounded-lg text-sm font-bold transition ${order.status === st ? "bg-green-500 text-white" : "bg-gray-200 hover:bg-green-100 text-gray-700"} disabled:opacity-50`}
                          >
                            {updatingOrderId === order.id ? "..." : st.charAt(0).toUpperCase() + st.slice(1)}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
