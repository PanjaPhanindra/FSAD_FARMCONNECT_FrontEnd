import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedButton from "../components/AnimatedButton.jsx";

/**
 * AdminTransactions.jsx
 * - Admin-only: View/all orders, mark as Dispatched/Delivered, track status
 * - Sort by date, filter by status, search by buyer/email
 * - Full transaction detail modal, confirmation feedback
 **/

export default function AdminTransactions() {
  const { getAllOrders, updateOrderStatus } = useContext(CartContext);
  const [filter, setFilter] = useState("all");
  const [sortDesc, setSortDesc] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState("");

  const orders = getAllOrders ? getAllOrders() : [];
  const filtered = orders
    .filter(
      o =>
        (filter === "all" || o.status === filter) &&
        (!search ||
          o.user.name.toLowerCase().includes(search.toLowerCase()) ||
          o.user.email.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) =>
      sortDesc
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );

  function markStatus(id, next) {
    updateOrderStatus(id, next);
    setToast(`Order marked as ${next}`);
    setTimeout(() => setToast(""), 1700);
  }

  //----------------------- RENDER -------------------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fff1] to-[#e7f3ff] pt-14 pb-24 px-4">
      <motion.section className="max-w-5xl mx-auto bg-white/91 rounded-xl shadow-2xl p-10 mb-10"
        initial={{ opacity: 0, y: 19 }} animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4 justify-between mb-6 flex-wrap">
          <h2 className="text-2xl font-bold text-green-900">Orders / Transactions</h2>
          <div className="flex gap-2 bg-green-50 rounded-xl px-3 py-2 shadow items-center">
            <select value={filter} onChange={e=>setFilter(e.target.value)} className="rounded px-2 py-1 border border-green-200">
              <option value="all">All Status</option>
              <option value="Processing">Processing</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <input
              type="text"
              className="rounded border border-green-200 px-2 ml-2"
              placeholder="Search buyer/email…"
              value={search}
              onChange={e=>setSearch(e.target.value)}
            />
            <button className="bg-green-100 px-2 rounded ml-3 text-green-800" onClick={()=>setSortDesc(v=>!v)}>Sort {sortDesc?"▼":"▲"}</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-admin">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Buyer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Advance</th>
                <th>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length===0?(
                <tr><td colSpan={7} className="text-center p-7 text-gray-500">No transactions found.</td></tr>
              ):filtered.map(order=>(
                <tr key={order.id} className={`status-${order.status==="Cancelled" ? "pending" : "active"}`}>
                  <td>{order.id}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{order.user.name}</td>
                  <td>₹{order.total}</td>
                  <td className={`status-tag`}>{order.status}</td>
                  <td>
                    {order.status==="Processing"&&(
                      <AnimatedButton label="Dispatch" color="secondary" size="sm"
                        onClick={()=>markStatus(order.id,"Dispatched")} />
                    )}
                    {order.status==="Dispatched"&&(
                      <AnimatedButton label="Deliver" color="primary" size="sm"
                        onClick={()=>markStatus(order.id,"Delivered")} />
                    )}
                    {order.status==="Delivered"||order.status==="Cancelled"?"—":null}
                  </td>
                  <td>
                    <button className="bg-green-100 px-3 py-1 rounded shadow" onClick={()=>setSelected(order)}>
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>
      {/* Order modal */}
      <AnimatePresence>
        {selected && (
          <motion.div className="modal-bg z-[140]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={()=>setSelected(null)}
          >
            <motion.div
              className="modal-content max-w-xl"
              initial={{ scale: 0.97, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.97, y: 15, opacity: 0 }}
              onClick={e=>e.stopPropagation()}
              tabIndex={0}
              role="dialog"
              aria-modal="true"
            >
              <h3 className="text-lg font-bold text-green-900 mb-3">Order {selected.id}</h3>
              <div className="mb-3"><strong>Date:</strong> {new Date(selected.createdAt).toLocaleString()}</div>
              <div className="mb-1"><strong>Buyer:</strong> {selected.user.name} ({selected.user.email})</div>
              <div className="mb-1"><strong>Status:</strong> <span className={`status-tag`}>{selected.status}</span></div>
              <div className="mb-2"><strong>Total:</strong> ₹{selected.total}</div>
              <div><u>Items:</u></div>
              <ul className="mb-3">
                {selected.items.map(item=>(
                  <li key={item.id} className="text-sm">
                    <span className="font-bold">{item.name}</span> ({item.qty} × ₹{item.price}) from {item.seller}
                  </li>
                ))}
              </ul>
              <div><strong>Shipping:</strong> {selected.shippingInfo ? Object.values(selected.shippingInfo).join(", ") : "N/A"}</div>
              <div className="mt-6 flex gap-3">
                <AnimatedButton label="Close" color="primary" size="sm" onClick={()=>setSelected(null)}/>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 21 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 21 }}
          >{toast}</motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
