import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import AnimatedButton from "../components/AnimatedButton.jsx";

import { motion, AnimatePresence } from "framer-motion";

/**
 * AdminUsers.jsx
 * - Admin-only: All users, filter/search, suspend/reactivate, inspect
 * - Modal for inspection, animated statuses, with role/status coloring
 **/

export default function AdminUsers() {
  const { allUsers, activateUser, suspendUser } = useContext(AuthContext);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModal, setUserModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  const users = allUsers ? allUsers() : [];

  // Filtering
  const filtered = users.filter(u =>
    (filter === "all" || u.role === filter) &&
    (!search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  function openUserModal(user) {
    setSelectedUser(user);
    setUserModal(true);
  }
  function closeUserModal() {
    setSelectedUser(null);
    setUserModal(false);
  }
  function handleSuspend(email) {
    suspendUser(email);
    setToast("User suspended!");
    setTimeout(() => setToast(""), 1700);
  }
  function handleActivate(email) {
    activateUser(email);
    setToast("Account reactivated!");
    setTimeout(() => setToast(""), 1700);
  }

  //---------------------------- RENDER --------------------------

  return (
    <div className="min-h-screen bg-gradient-to-bl from-[#fafdff] to-[#e9ffe8] pt-14 pb-24 px-4">
      <motion.section className="max-w-5xl mx-auto bg-white/93 rounded-xl shadow-2xl p-10 mb-10"
        initial={{ opacity: 0, y: 21 }} animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4 justify-between mb-6 flex-wrap">
          <h2 className="text-2xl font-extrabold text-green-900">Users</h2>
          <div className="flex gap-2 bg-green-50 rounded-xl px-4 py-2 shadow items-center">
            <select value={filter} onChange={e=>setFilter(e.target.value)} className="rounded px-2 py-1 border border-green-200">
              <option value="all">All Roles</option>
              <option value="buyer">Buyers</option>
              <option value="seller">Sellers</option>
              <option value="admin">Admins</option>
            </select>
            <input
              type="text"
              className="rounded border border-green-200 px-2 ml-2"
              placeholder="Search users…"
              value={search}
              onChange={e=>setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-admin">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Inspect</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length===0?(
                <tr><td colSpan={7} className="text-center p-7 text-gray-500">No users found.</td></tr>
              ):filtered.map(u=>(
                <tr key={u.email} className={u.status==="suspended"?"status-pending":"status-active"}>
                  <td
                    onClick={()=>openUserModal(u)}
                    className="underline cursor-pointer"
                  >{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`status-tag status-${u.role}`}>{u.role}</span></td>
                  <td><span className={`status-tag ${u.status==="suspended"?"status-pending":"status-active"}`}>{u.status}</span></td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="bg-green-100 px-3 py-1 rounded shadow" onClick={()=>openUserModal(u)}>View</button>
                  </td>
                  <td>
                    {u.status==="suspended"?(
                      <AnimatedButton label="Activate" color="secondary" size="sm" onClick={()=>handleActivate(u.email)}/>
                    ):(
                      <AnimatedButton label="Suspend" color="danger" size="sm" onClick={()=>handleSuspend(u.email)}/>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>
      {/* User modal */}
      <AnimatePresence>
        {userModal && selectedUser && (
          <motion.div className="modal-bg z-[133]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeUserModal}
          >
            <motion.div
              className="modal-content max-w-lg"
              initial={{ scale: 0.98, y: 12, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.98, y: 12, opacity: 0 }}
              onClick={e=>e.stopPropagation()}
              tabIndex={0}
              role="dialog"
              aria-modal="true"
            >
              <h3 className="text-xl font-bold text-green-900 mb-3">User Details</h3>
              <div className="flex gap-4 items-center mb-4">
                <img src={selectedUser.avatarUrl || "/assets/avatar-guest.png"} className="h-14 w-14 rounded-full border-2" alt="avatar"/>
                <div>
                  <div className="font-bold text-green-900">{selectedUser.name}</div>
                  <div className="text-xs mt-0.5 text-gray-500">{selectedUser.email}</div>
                  <span className={`status-tag status-${selectedUser.role}`}>{selectedUser.role}</span>
                  <span className={`ml-3 status-tag ${selectedUser.status==="suspended"?"status-pending":"status-active"}`}>{selectedUser.status}</span>
                </div>
              </div>
              <div className="text-xs mb-1 text-gray-700">Joined: {new Date(selectedUser.createdAt).toLocaleString()}</div>
              <div className="mb-1">Profile: <pre className="bg-green-50 rounded-lg px-2 py-1 inline-block">{JSON.stringify(selectedUser.profile, null, 2)}</pre></div>
              <div className="flex gap-4 mt-6">
                {selectedUser.status==="suspended"?(
                  <AnimatedButton label="Activate" color="secondary" size="sm" onClick={()=>{handleActivate(selectedUser.email);closeUserModal();}}/>
                ):(
                  <AnimatedButton label="Suspend" color="danger" size="sm" onClick={()=>{handleSuspend(selectedUser.email);closeUserModal();}}/>
                )}
                <AnimatedButton label="Close" color="primary" size="sm" onClick={closeUserModal}/>
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
