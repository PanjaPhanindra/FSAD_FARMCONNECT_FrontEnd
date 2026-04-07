import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const AVATAR_OPTIONS = [
  { url: "/assets/avatar-boy1.png", label: "Boy 1" },
  { url: "/assets/avatar-boy2.png", label: "Boy 2" },
  { url: "/assets/avatar-girl1.png", label: "Girl 1" },
  { url: "/assets/avatar-girl2.png", label: "Girl 2" },
];

export default function Profile() {
  const { user, updateProfile, changePassword, deleteAccount, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("/assets/avatar-boy1.png");

  const [pwd, setPwd] = useState({ old: "", new1: "", new2: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [editError, setEditError] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [loading, setLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  // Sync edit fields from user when user data changes or edit mode opens
  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditAvatar(user.avatarUrl || "/assets/avatar-boy1.png");
    }
  }, [user]);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  }

  function openEdit() {
    // Re-sync from current user before opening
    setEditName(user?.name || "");
    setEditAvatar(user?.avatarUrl || "/assets/avatar-boy1.png");
    setEditError("");
    setEditMode(true);
  }

  function cancelEdit() {
    setEditMode(false);
    setEditError("");
  }

  async function saveProfile(e) {
    e.preventDefault();
    setEditError("");
    if (!editName || editName.trim().length < 2) {
      setEditError("Name must be at least 2 characters.");
      return;
    }
    setLoading(true);
    const success = await updateProfile({ name: editName.trim(), avatarUrl: editAvatar });
    setLoading(false);
    if (success) {
      setEditMode(false);
      showToast("✅ Profile updated successfully!");
    } else {
      setEditError("Failed to update profile. Please try again.");
    }
  }

  async function changePwd(e) {
    e.preventDefault();
    setPwdError("");
    if (!pwd.old || !pwd.new1 || !pwd.new2) {
      setPwdError("Please fill all password fields.");
      return;
    }
    if (pwd.new1 !== pwd.new2) {
      setPwdError("New passwords do not match.");
      return;
    }
    if (pwd.new1.length < 6) {
      setPwdError("New password must be at least 6 characters.");
      return;
    }
    setPwdLoading(true);
    const result = await changePassword(pwd.old, pwd.new1);
    setPwdLoading(false);
    if (result.success) {
      setPwdError("");
      setPwd({ old: "", new1: "", new2: "" });
      setShowPwd(false);
      showToast("✅ Password changed successfully!");
    } else {
      setPwdError(result.message || "Failed to change password.");
    }
  }

  async function confirmDelete() {
    if (window.confirm("Are you SURE you want to permanently delete your account? This cannot be undone!")) {
      const success = await deleteAccount();
      if (success) {
        navigate("/login");
      } else {
        showToast("❌ Failed to delete account.", "error");
      }
    }
  }

  const currentAvatar = user?.avatarUrl || "/assets/avatar-boy1.png";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 px-4 pt-10 pb-24">

      {/* ========== PROFILE CARD ========== */}
      <motion.section
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-7 mb-8 border border-gray-200"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col md:flex-row gap-7 items-start">
          {/* Avatar + info */}
          <div className="flex flex-col items-center min-w-[180px] gap-3">
            <img
              src={editMode ? editAvatar : currentAvatar}
              className="w-28 h-28 rounded-full object-cover border-4 border-green-400 shadow-lg"
              alt="avatar"
              onError={e => { e.target.src = "https://ui-avatars.com/api/?name=" + (user?.name || "U") + "&background=22c55e&color=fff&size=128"; }}
            />
            <span className="font-bold text-green-800 text-xl">{user?.name}</span>
            <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-800 rounded-full">
              {user?.role?.toUpperCase()}
            </span>
            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{user?.email}</span>
            <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
              Status: {user?.status || "active"}
            </span>

            {/* Avatar picker in edit mode */}
            {editMode && (
              <div className="mt-3 w-full">
                <p className="text-sm font-bold text-gray-700 mb-2 text-center">Choose Avatar:</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {AVATAR_OPTIONS.map(opt => (
                    <button
                      key={opt.url}
                      type="button"
                      onClick={() => setEditAvatar(opt.url)}
                      className={`rounded-full p-1 transition border-4 ${
                        editAvatar === opt.url
                          ? "border-green-500 shadow-lg"
                          : "border-transparent hover:border-gray-300"
                      }`}
                      title={opt.label}
                    >
                      <img
                        src={opt.url}
                        className="h-14 w-14 object-cover rounded-full"
                        alt={opt.label}
                        onError={e => e.target.style.opacity = "0.3"}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Edit form */}
          <form onSubmit={saveProfile} className="flex flex-1 flex-col gap-4">
            <label className="text-gray-700 font-semibold">
              Name
              <input
                type="text"
                value={editMode ? editName : (user?.name || "")}
                onChange={e => setEditName(e.target.value)}
                disabled={!editMode}
                className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800 ${
                  editMode ? "border-green-400 bg-white" : "border-gray-200 bg-gray-100"
                }`}
                placeholder="Enter your name"
              />
            </label>

            <label className="text-gray-700 font-semibold">
              Email
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500"
              />
            </label>

            {editError && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm font-semibold">
                ⚠️ {editError}
              </div>
            )}

            {editMode ? (
              <div className="flex gap-3 mt-2 flex-wrap">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-lg font-bold transition shadow-md disabled:opacity-50 text-sm"
                >
                  {loading ? "⏳ Saving..." : "💾 Save Profile"}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2.5 rounded-lg font-bold transition text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex gap-3 mt-2 flex-wrap">
                <button
                  type="button"
                  onClick={openEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold transition shadow-md text-sm"
                >
                  ✏️ Edit Profile
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-bold transition shadow-md text-sm"
                >
                  🗑️ Delete Account
                </button>
                <button
                  type="button"
                  onClick={() => { logout(); navigate("/login"); }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg font-bold transition shadow-md text-sm"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </form>
        </div>
      </motion.section>

      {/* ========== CHANGE PASSWORD ========== */}
      <motion.section
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200"
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="mb-4 font-bold text-green-800 text-lg">🔒 Change Password</h3>
        <form onSubmit={changePwd} className="flex flex-wrap gap-4 items-end">
          <label className="flex-1 min-w-[160px] text-gray-700 font-semibold text-sm">
            Current Password
            <input
              type={showPwd ? "text" : "password"}
              value={pwd.old}
              onChange={e => setPwd(p => ({ ...p, old: e.target.value }))}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800"
              placeholder="Current password"
            />
          </label>
          <label className="flex-1 min-w-[160px] text-gray-700 font-semibold text-sm">
            New Password
            <input
              type={showPwd ? "text" : "password"}
              value={pwd.new1}
              onChange={e => setPwd(p => ({ ...p, new1: e.target.value }))}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800"
              placeholder="New password (min 6 chars)"
            />
          </label>
          <label className="flex-1 min-w-[160px] text-gray-700 font-semibold text-sm">
            Confirm New
            <input
              type={showPwd ? "text" : "password"}
              value={pwd.new2}
              onChange={e => setPwd(p => ({ ...p, new2: e.target.value }))}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800"
              placeholder="Confirm new password"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold"
              onClick={() => setShowPwd(v => !v)}
            >
              {showPwd ? "🙈 Hide" : "👁 Show"}
            </button>
            <button
              type="submit"
              disabled={pwdLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold transition disabled:opacity-50 text-sm"
            >
              {pwdLoading ? "⏳ Changing..." : "🔑 Change Password"}
            </button>
          </div>
        </form>
        {pwdError && (
          <div className="mt-3 bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm font-semibold">
            ⚠️ {pwdError}
          </div>
        )}
      </motion.section>

      {/* ========== TOAST ========== */}
      <AnimatePresence>
        {toast.msg && (
          <motion.div
            className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-xl font-bold z-50 text-white ${
              toast.type === "error" ? "bg-red-600" : "bg-green-600"
            }`}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
