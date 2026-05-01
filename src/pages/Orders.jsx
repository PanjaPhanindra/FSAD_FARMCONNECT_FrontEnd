import React, { useContext, useState, useEffect, useMemo } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Orders.jsx — Backend-integrated order management
 * - Fetches orders from MySQL via /orders/buyer/{email}
 * - Cancel order via /orders/{id}/cancel (restores stock)
 * - Star rating for delivered orders via /products/{id}/rate
 * - Status tracking timeline
 */

export default function Orders() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [ratingModal, setRatingModal] = useState(null); // { orderId, item }
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!user?.email) return;
    loadOrders();
  }, [user?.email]);

  async function loadOrders() {
    try {
      setLoading(true);
      const res = await fetch(`https://fsad-farmconnect-backend-1.onrender.com/orders/buyer/${user.email}`);
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function handleCancel(orderId) {
    if (!window.confirm("Cancel this order? Stock will be restored.")) return;
    try {
      const res = await fetch(`https://fsad-farmconnect-backend-1.onrender.com/orders/${orderId}/cancel`, { method: "PUT" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      showToast("✅ Order cancelled successfully!");
      loadOrders();
    } catch (err) {
      showToast("❌ " + err.message);
    }
  }

  async function submitRating() {
    if (!ratingModal) return;
    setRatingLoading(true);
    try {
      const res = await fetch(
        `https://fsad-farmconnect-backend-1.onrender.com/products/${ratingModal.item.productId}/rate?rating=${ratingValue}`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Failed to submit rating");
      showToast("⭐ Rating submitted! Thank you.");
      setRatingModal(null);
    } catch (err) {
      showToast("❌ " + err.message);
    } finally {
      setRatingLoading(false);
    }
  }

  // Filter + Sort
  const filteredOrders = useMemo(() => {
    let result = orders;
    if (filterStatus !== "all") result = result.filter(o => o.status === filterStatus);
    if (sortBy === "newest") result = [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortBy === "oldest") result = [...result].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortBy === "amount-high") result = [...result].sort((a, b) => b.totalAmount - a.totalAmount);
    else if (sortBy === "amount-low") result = [...result].sort((a, b) => a.totalAmount - b.totalAmount);
    return result;
  }, [orders, filterStatus, sortBy]);

  const stats = useMemo(() => ({
    total: orders.length,
    delivered: orders.filter(o => o.status === "delivered").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    processing: orders.filter(o => o.status === "processing").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
    totalSpent: orders.reduce((s, o) => s + o.totalAmount, 0),
  }), [orders]);

  function getStatusStyle(status) {
    return {
      placed: { bg: "bg-blue-100", text: "text-blue-800", icon: "📦", label: "Order Placed" },
      processing: { bg: "bg-yellow-100", text: "text-yellow-800", icon: "⚙️", label: "Processing" },
      shipped: { bg: "bg-purple-100", text: "text-purple-800", icon: "🚚", label: "Shipped" },
      delivered: { bg: "bg-green-100", text: "text-green-800", icon: "✅", label: "Delivered" },
      cancelled: { bg: "bg-red-100", text: "text-red-800", icon: "❌", label: "Cancelled" },
    }[status] || { bg: "bg-blue-100", text: "text-blue-800", icon: "📦", label: "Placed" };
  }

  function getDeliverySteps(status) {
    const steps = [
      { label: "Order Placed", status: "placed" },
      { label: "Processing", status: "processing" },
      { label: "Shipped", status: "shipped" },
      { label: "Delivered", status: "delivered" },
    ];
    const map = { placed: 0, processing: 1, shipped: 2, delivered: 3, cancelled: -1 };
    const cur = map[status] ?? 0;
    return steps.map((s, i) => ({ ...s, completed: i < cur, current: i === cur, pending: i > cur }));
  }

  const statuses = ["all", "placed", "processing", "shipped", "delivered", "cancelled"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 via-pink-600 to-red-600 text-white p-6 shadow-xl sticky top-0 z-30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigate("/buyer-dashboard")} className="hover:bg-white/20 px-4 py-2 rounded-lg transition">
              ← Back
            </button>
            <h1 className="text-3xl font-bold">My Orders</h1>
            <div className="text-right"><p className="text-pink-100">{user?.name}</p></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {[
              { label: "Total", val: stats.total },
              { label: "Delivered", val: stats.delivered, cls: "text-green-300" },
              { label: "Shipped", val: stats.shipped, cls: "text-blue-300" },
              { label: "Processing", val: stats.processing, cls: "text-yellow-300" },
              { label: "Cancelled", val: stats.cancelled, cls: "text-red-300" },
              { label: `Spent ₹`, val: stats.totalSpent.toFixed(0) },
            ].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur px-3 py-2 rounded-lg text-center text-sm">
                <p className="text-pink-100">{s.label}</p>
                <p className={`text-2xl font-bold ${s.cls || ""}`}>{s.val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700">Filter by Status</label>
              <div className="flex flex-wrap gap-2">
                {statuses.map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${filterStatus === s ? "bg-purple-600 text-white shadow-lg" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}`}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700">Sort By</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount-high">Highest Amount</option>
                <option value="amount-low">Lowest Amount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 text-white text-xl">Loading orders...</div>
        )}

        {/* Empty */}
        {!loading && filteredOrders.length === 0 && (
          <motion.div className="bg-white rounded-lg shadow-lg p-12 text-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-gray-500 text-xl mb-4">No orders found</p>
            <p className="text-gray-400 mb-6">
              {filterStatus === "all" ? "You haven't placed any orders yet." : `No orders with status "${filterStatus}"`}
            </p>
            <button onClick={() => navigate("/buyer-dashboard")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-bold transition">
              Start Shopping
            </button>
          </motion.div>
        )}

        {/* Orders list */}
        {!loading && filteredOrders.length > 0 && (
          <div className="space-y-6">
            {filteredOrders.map((order, idx) => {
              const style = getStatusStyle(order.status);
              const steps = getDeliverySteps(order.status);
              const items = order.items || [];

              return (
                <motion.div key={order.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition overflow-hidden"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>

                  {/* Order Header */}
                  <div className={`${style.bg} ${style.text} p-6 border-l-4 border-current`}>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{style.icon}</span>
                        <div>
                          <p className="text-sm font-semibold">Order ID</p>
                          <p className="text-xl font-bold">ORD-{order.id}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Status</p>
                        <p className="text-xl font-bold">{style.label}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Date</p>
                        <p className="text-lg">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div className="px-6 py-3 bg-gray-50 border-b text-sm text-gray-700">
                      📍 {order.shippingName} | {order.shippingPhone} | {order.shippingAddress}, {order.shippingCity}, {order.shippingState} - {order.shippingPincode}
                    </div>
                  )}

                  {/* Delivery timeline */}
                  <div className="p-6 border-b bg-gray-50">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Delivery Status</p>
                    <div className="flex gap-2 overflow-x-auto">
                      {steps.map((step, i) => (
                        <div key={step.status} className="flex items-center">
                          <div className="flex flex-col items-center min-w-max">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                              step.completed ? "bg-green-500 text-white" :
                              step.current ? "bg-blue-500 text-white ring-2 ring-blue-300" :
                              "bg-gray-300 text-gray-600"
                            }`}>
                              {step.completed ? "✓" : i + 1}
                            </div>
                            <p className="text-xs text-gray-600 mt-2 text-center w-20">{step.label}</p>
                          </div>
                          {i < steps.length - 1 && (
                            <div className={`h-1 w-8 mx-2 ${step.completed ? "bg-green-500" : "bg-gray-300"}`} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="p-6 border-b">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Items ({items.length})</p>
                    <div className="space-y-3">
                      {items.map(item => (
                        <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                          {item.productImage && (
                            <img src={item.productImage} alt={item.productName}
                              className="w-16 h-16 object-cover rounded" />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{item.productName}</p>
                            <p className="text-sm text-gray-600">By {item.sellerName}</p>
                            <div className="flex justify-between mt-2">
                              <span className="text-sm text-gray-700">₹{item.price} × {item.quantity}</span>
                              <span className="font-bold text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                            {/* ⭐ Rate button for delivered orders */}
                            {order.status === "delivered" && (
                              <button
                                onClick={() => { setRatingModal({ orderId: order.id, item }); setRatingValue(5); }}
                                className="mt-2 text-xs font-semibold text-yellow-600 hover:text-yellow-700 bg-yellow-50 hover:bg-yellow-100 px-3 py-1 rounded-lg transition"
                              >
                                ⭐ Rate this product
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary + Actions */}
                  <div className="p-6 bg-gradient-to-r from-slate-50 to-slate-100">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-gray-600">Total Amount</p>
                        <p className="text-2xl font-bold text-purple-600">₹{order.totalAmount?.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      {order.status === "placed" && (
                        <button onClick={() => handleCancel(order.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition">
                          ❌ Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ⭐ Rating Modal */}
      <AnimatePresence>
        {ratingModal && (
          <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full"
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Rate Product</h3>
              <p className="text-gray-600 mb-4">{ratingModal.item.productName}</p>
              <div className="flex gap-2 justify-center mb-6">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => setRatingValue(star)}
                    className={`text-4xl transition ${star <= ratingValue ? "text-yellow-400" : "text-gray-300"}`}>
                    ★
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={submitRating} disabled={ratingLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold transition disabled:opacity-50">
                  {ratingLoading ? "Submitting..." : "Submit Rating"}
                </button>
                <button onClick={() => setRatingModal(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-bold transition">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div className="fixed bottom-6 right-6 bg-gray-800 text-white px-6 py-3 rounded-xl shadow-xl font-bold z-50"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
