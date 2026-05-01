import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

/**
 * ============================================================================
 * CartContext.jsx - Complete Shopping Cart & Order Management (600+ Lines)
 * ============================================================================
 * 
 * Comprehensive context for managing:
 * - Shopping cart operations (add, remove, update, clear)
 * - Order management (create, update, cancel)
 * - Order tracking and history
 * - Review management
 * - Admin/seller order filtering
 * - Analytics and statistics
 * - LocalStorage persistence
 * - Order events tracking
 * 
 * Features:
 * - Real-time cart calculations
 * - Duplicate item deduplication
 * - Order history with timestamps
 * - Order status tracking
 * - Order event logging
 * - Seller-specific order filtering
 * - User order retrieval
 * - Order cancellation
 * - Product reviews per order
 * - Analytics aggregation
 * - Full persistence with localStorage
 * 
 * Data Structure:
 * - cart: { items: [], total: 0 }
 * - orders: { id, user, items, total, shipping, status, events }
 * 
 * ============================================================================
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const LS_CART = "fc_cart_v2";
const LS_ORDERS = "fc_orders_v2";

/**
 * Simulated API delay utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

export const CartContext = createContext();

// ============================================================================
// CART PROVIDER COMPONENT
// ============================================================================

/**
 * CartProvider - Main provider component
 * Manages all cart and order operations
 */
export function CartProvider({ children }) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Shopping cart state: { items: [...], total: 0 }
  const [cart, setCart] = useState({ items: [], total: 0 });

  // Order history state
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_ORDERS);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error("Failed to load orders from localStorage:", err);
      return [];
    }
  });

  // Loading state for async operations
  const [loading, setLoading] = useState(false);

  // Error state
  const [error, setError] = useState(null);

  // ============================================================================
  // FETCH FROM DATABASE
  // ============================================================================

  const fetchCartFromDB = useCallback(async () => {
    const savedUser = localStorage.getItem("fc_user");
    if (!savedUser) {
      setCart({ items: [], total: 0 });
      return;
    }
    try {
      const user = JSON.parse(savedUser);
      if (!user.email) return;

      const res = await fetch(`https://fsad-farmconnect-backend-1.onrender.com/cart/${user.email}`);
      const data = await res.json();
      
      const mappedItems = data.map(item => ({
        id: item.productId,          // product's ID
        cartItemId: item.id,         // DB row ID used for remove/update
        name: item.productName,
        price: item.price,
        stock: item.stock,
        sellerName: item.sellerName,
        sellerEmail: item.sellerEmail,
        image: item.productImage,
        qty: item.quantity,
        quantity: item.quantity
      }));
      setCart({ items: mappedItems, total: computeTotal(mappedItems) });
    } catch (err) {
      console.error("Failed to sync cart:", err);
    }
  }, []);

  useEffect(() => {
    fetchCartFromDB();
  }, [fetchCartFromDB]);

  // ============================================================================
  // EFFECTS - PERSISTENCE
  // ============================================================================

  /**
   * Persist orders to localStorage on change
   */
  useEffect(() => {
    try {
      localStorage.setItem(LS_ORDERS, JSON.stringify(orders));
    } catch (err) {
      console.error("Failed to save orders to localStorage:", err);
    }
  }, [orders]);

  // ============================================================================
  // UTILITY FUNCTIONS - CALCULATIONS
  // ============================================================================

  /**
   * Calculate total price for cart items
   * @param {Array} items - Array of cart items
   * @returns {number} Total price
   */
  function computeTotal(items) {
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const qty = parseInt(item.qty || item.quantity) || 0;
      return sum + (price * qty);
    }, 0);
  }

  /**
   * Validate item before adding to cart
   * @param {Object} product - Product to validate
   * @param {number} qty - Quantity to validate
   * @returns {Object} { valid, error }
   */
  function validateItem(product, qty) {
    if (!product || !product.id) {
      return { valid: false, error: "Invalid product" };
    }
    if (qty < 1) {
      return { valid: false, error: "Quantity must be at least 1" };
    }
    if (qty > (product.stock || 999)) {
      return { valid: false, error: `Only ${product.stock} available` };
    }
    return { valid: true };
  }

  /**
   * Get cart item count
   * @returns {number} Total items in cart
   */
  function getCartItemCount() {
    return cart.items.reduce((sum, item) => sum + (item.qty || item.quantity || 0), 0);
  }

  // ============================================================================
  // CART OPERATIONS
  // ============================================================================

  /**
   * Add product to cart with quantity
   */
  const addToCart = useCallback((product, qty = 1) => {
    const savedUser = localStorage.getItem("fc_user");
    if (!savedUser) {
      setError("Please login to add items to cart");
      return false;
    }
    const user = JSON.parse(savedUser);

    const validation = validateItem(product, qty);
    if (!validation.valid) {
      setError(validation.error);
      return false;
    }

    setError(null);
    setLoading(true);

    // ✅ Flat payload matching new CartItem model (no nested product object)
    const payload = {
        userEmail: user.email,
        productId: product.id,
        quantity: qty
    };

    fetch("https://fsad-farmconnect-backend-1.onrender.com/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to add");
        return fetchCartFromDB();
    })
    .catch(err => {
        console.error(err);
        setError("Failed to add to cart");
    })
    .finally(() => setLoading(false));

    return true;
  }, [fetchCartFromDB]);

  /**
   * Remove item from cart by ID
   */
  const removeFromCart = useCallback((productId) => {
    const itemToRemove = cart.items.find(i => i.id === productId || i.cartItemId === productId);
    if (!itemToRemove || !itemToRemove.cartItemId) return;

    fetch(`https://fsad-farmconnect-backend-1.onrender.com/cart/remove/${itemToRemove.cartItemId}`, { method: "DELETE" })
      .then(() => fetchCartFromDB())
      .catch(console.error);
  }, [cart.items, fetchCartFromDB]);

  /**
   * Update quantity
   */
  const updateCartQty = useCallback((productId, qty) => {
    const validQty = Math.max(1, parseInt(qty) || 1);
    const itemToUpdate = cart.items.find(i => i.id === productId || i.cartItemId === productId);
    if (!itemToUpdate || !itemToUpdate.cartItemId) return;

    fetch(`https://fsad-farmconnect-backend-1.onrender.com/cart/update/${itemToUpdate.cartItemId}?quantity=${validQty}`, { method: "PUT" })
      .then(() => fetchCartFromDB())
      .catch(console.error);
  }, [cart.items, fetchCartFromDB]);

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(() => {
    const savedUser = localStorage.getItem("fc_user");
    if (!savedUser) return;
    const user = JSON.parse(savedUser);

    if (user.email) {
      fetch(`https://fsad-farmconnect-backend-1.onrender.com/cart/${user.email}`, { method: "DELETE" })
        .then(() => fetchCartFromDB())
        .catch(console.error);
    }
  }, [fetchCartFromDB]);

  /**
   * Get current cart items
   * @returns {Array} Cart items
   */
  function getCartItems() {
    return cart.items || [];
  }

  /**
   * Get current cart total
   * @returns {number} Cart total
   */
  function getCartTotal() {
    return parseFloat(cart.total).toFixed(2);
  }

  // ============================================================================
  // ORDER OPERATIONS
  // ============================================================================

  /**
   * Place order - Convert cart to order
   * @param {Object} user - User object { email, name }
   * @param {Object} shippingInfo - Shipping information
   * @param {Object} coupon - Optional coupon info
   * @returns {Promise} { order, error }
   */
  const placeOrder = async (user, shippingInfo, coupon = null) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API processing
      await sleep(1200 + Math.random() * 400);

      // Validate cart
      if (!cart.items || cart.items.length === 0) {
        throw new Error("Cart is empty. Cannot place order.");
      }

      // Validate user
      if (!user || !user.email) {
        throw new Error("User information is required.");
      }

      // Validate shipping
      if (!shippingInfo || !shippingInfo.address) {
        throw new Error("Shipping information is required.");
      }

      // Create order object
      const order = {
        id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase(),
        user: {
          email: user.email,
          name: user.name || "Guest"
        },
        items: cart.items.map(i => ({
          id: i.id,
          name: i.name,
          price: parseFloat(i.price) || 0,
          qty: parseInt(i.qty) || 0,
          seller: i.sellerName || i.seller || "Unknown Seller",
          image: i.image || null
        })),
        subtotal: parseFloat(cart.total).toFixed(2),
        coupon: coupon ? {
          code: coupon.code,
          discount: coupon.discount
        } : null,
        total: parseFloat(cart.total).toFixed(2),
        shippingInfo: {
          fullName: shippingInfo.fullName,
          email: shippingInfo.email,
          phone: shippingInfo.phone,
          address: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          pinCode: shippingInfo.pinCode,
          landmark: shippingInfo.landmark || ""
        },
        payment: {
          method: "Online",
          status: "Completed",
          transactionId: `TXN-${Date.now()}`
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: "Processing",
        trackingId: "TXN" + Math.random().toString(36).substr(2, 5).toUpperCase(),
        events: [
          {
            time: new Date().toISOString(),
            status: "Order Placed",
            description: "Your order has been placed successfully"
          },
          {
            time: new Date(Date.now() + 1000).toISOString(),
            status: "Confirmed",
            description: "Order confirmed by seller"
          }
        ]
      };

      // Add order to history
      setOrders(prev => [order, ...prev]);

      // Clear cart
      clearCart();

      setLoading(false);
      return { order, error: null };
    } catch (err) {
      setLoading(false);
      const errorMsg = err.message || "Failed to place order";
      setError(errorMsg);
      return { order: null, error: errorMsg };
    }
  };

  /**
   * Update order status
   * @param {string} orderId - Order ID
   * @param {string} newStatus - New status
   */
  const updateOrderStatus = useCallback((orderId, newStatus) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
              updatedAt: new Date().toISOString(),
              events: [
                ...order.events,
                {
                  time: new Date().toISOString(),
                  status: newStatus,
                  description: `Order status updated to ${newStatus}`
                }
              ]
            }
          : order
      )
    );
  }, []);

  /**
   * Cancel order
   * @param {string} orderId - Order ID to cancel
   * @param {string} reason - Cancellation reason
   */
  const cancelOrder = useCallback((orderId, reason = "") => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? {
              ...order,
              status: "Cancelled",
              cancellationReason: reason,
              updatedAt: new Date().toISOString(),
              events: [
                ...order.events,
                {
                  time: new Date().toISOString(),
                  status: "Cancelled",
                  description: `Order cancelled. Reason: ${reason || "User request"}`
                }
              ]
            }
          : order
      )
    );
  }, []);

  /**
   * Add event to order tracking
   * @param {string} orderId - Order ID
   * @param {string} status - Event status
   * @param {string} description - Event description
   */
  const addOrderEvent = useCallback((orderId, status, description = "") => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? {
              ...order,
              updatedAt: new Date().toISOString(),
              events: [
                ...order.events,
                {
                  time: new Date().toISOString(),
                  status,
                  description
                }
              ]
            }
          : order
      )
    );
  }, []);

  /**
   * Leave review for product in order
   * @param {string} orderId - Order ID
   * @param {string} productId - Product ID
   * @param {Object} review - Review object { rating, text, reviewer }
   */
  const leaveOrderReview = useCallback((orderId, productId, review) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? {
              ...order,
              items: order.items.map(item =>
                item.id === productId
                  ? {
                      ...item,
                      review: {
                        ...review,
                        createdAt: new Date().toISOString()
                      }
                    }
                  : item
              )
            }
          : order
      )
    );
  }, []);

  // ============================================================================
  // ORDER RETRIEVAL & FILTERING
  // ============================================================================

  /**
   * Get all orders for specific user
   * @param {string} email - User email
   * @returns {Array} Filtered orders
   */
  function getOrdersForUser(email) {
    return orders.filter(o => o.user.email === email);
  }

  /**
   * Get all orders (admin only)
   * @returns {Array} All orders
   */
  function getAllOrders() {
    return orders;
  }

  /**
   * Get orders for specific seller
   * @param {string} sellerName - Seller name
   * @returns {Array} Filtered orders
   */
  function getOrdersForSeller(sellerName) {
    return orders.filter(o =>
      o.items.some(i => i.seller === sellerName)
    );
  }

  /**
   * Get single order by ID
   * @param {string} orderId - Order ID
   * @returns {Object} Order object or null
   */
  function getOrderById(orderId) {
    return orders.find(o => o.id === orderId) || null;
  }

  // ============================================================================
  // ANALYTICS & STATISTICS
  // ============================================================================

  /**
   * Get order statistics by status
   * @returns {Object} Status counts
   */
  function getOrderStatusStats() {
    const stats = {};
    for (const order of orders) {
      const status = order.status || "Unknown";
      stats[status] = (stats[status] || 0) + 1;
    }
    return stats;
  }

  /**
   * Get total revenue
   * @returns {number} Total revenue
   */
  function getTotalRevenue() {
    return orders.reduce((sum, order) => {
      const total = parseFloat(order.total) || 0;
      return order.status === "Cancelled" ? sum : sum + total;
    }, 0);
  }

  /**
   * Get total orders for seller
   * @param {string} seller - Seller name
   * @returns {number} Total items
   */
  function getTotalOrdersBySeller(seller) {
    return orders.reduce((sum, order) => {
      if (order.status === "Cancelled") return sum;
      const itemsQty = order.items
        .filter(i => i.seller === seller)
        .reduce((qty, i) => qty + i.qty, 0);
      return sum + itemsQty;
    }, 0);
  }

  /**
   * Get average order value
   * @returns {number} Average order value
   */
  function getAverageOrderValue() {
    if (orders.length === 0) return 0;
    const activeOrders = orders.filter(o => o.status !== "Cancelled");
    if (activeOrders.length === 0) return 0;
    const total = activeOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    return (total / activeOrders.length).toFixed(2);
  }

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value = {
    // Cart data
    cart,
    loading,
    error,

    // Cart operations
    addToCart,
    removeFromCart,
    updateCartQty,
    clearCart,
    getCartItems,
    getCartTotal,
    getCartItemCount,

    // Order operations
    orders,
    placeOrder,
    updateOrderStatus,
    cancelOrder,
    addOrderEvent,
    leaveOrderReview,

    // Order retrieval
    getOrdersForUser,
    getAllOrders,
    getOrdersForSeller,
    getOrderById,

    // Analytics
    getOrderStatusStats,
    getTotalRevenue,
    getTotalOrdersBySeller,
    getAverageOrderValue
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * Custom hook for using cart context
 * @returns {Object} Cart context value
 */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}

/**
 * Custom hook for cart items only
 * @returns {Array} Cart items
 */
export function useCartItems() {
  const { cart } = useContext(CartContext);
  return cart.items || [];
}

/**
 * Custom hook for cart total only
 * @returns {number} Cart total
 */
export function useCartTotal() {
  const { cart } = useContext(CartContext);
  return parseFloat(cart.total).toFixed(2);
}
