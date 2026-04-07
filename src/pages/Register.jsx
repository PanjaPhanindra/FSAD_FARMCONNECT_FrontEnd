import React, { useState, useContext, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedButton from "../components/AnimatedButton.jsx";
import Loader from "../components/Loader.jsx";

/**
 * Register.jsx - FINAL & CORRECTED (NO ADMIN)
 * - New user registration (role selection, name, email, password, confirm)
 * - Live field validation, animated feedback, error/success toasts
 * - Role-based registration with proper redirects (Buyer / Seller only)
 * - Animated panel, mobile-first, accessible
 */

const ROLE_OPTIONS = [
  { value: "buyer", label: "🛒 Buyer", desc: "Find & order rural products, leave reviews" },
  { value: "seller", label: "🧑‍🌾 Seller", desc: "List, manage and sell products" }
];

function PasswordStrength({ value }) {
  if (!value) return null;
  const ok = value.length >= 6;
  return (
    <div className="flex gap-2 items-center mt-1 text-xs">
      <span className={`font-bold ${ok ? "text-green-600" : "text-red-600"}`}>
        {ok ? "✓ Strong enough" : "✗ Min 6 characters"}
      </span>
    </div>
  );
}

export default function Register() {
  const { register, authError, clearAuthError } = useContext(AuthContext);

  const navigate = useNavigate();

  // UI state
  const [role, setRole] = useState("buyer");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const firstInput = useRef();

  // Captcha state
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");

  function generateCaptcha() {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setCaptchaQuestion(`${a} + ${b} = ?`);
    setCaptchaAnswer(String(a + b));
    setCaptchaInput("");
  }

  // Initial effect
  useEffect(() => {
    setForm({ name: "", email: "", password: "", confirm: "" });
    if (clearAuthError) clearAuthError();
    if (firstInput.current) firstInput.current.focus();
    generateCaptcha();
  }, []);

  // Real-time validation
  const errors = {};
  if (!form.name || form.name.trim().length < 2) errors.name = "Enter your full name (2+ characters)";
  if (!form.email || !form.email.includes("@")) errors.email = "Valid email required";
  if (!form.password || form.password.length < 6) errors.password = "At least 6 characters";
  if (form.password !== form.confirm) errors.confirm = "Passwords don't match";

  // On submit - Registration
  async function onSubmit(e) {
    e.preventDefault();
    clearAuthError();

    if (Object.keys(errors).length) {
      setToast("❌ Fix highlighted fields.");
      return;
    }

    // Captcha check
    if (captchaInput.trim() === "" || captchaInput.trim() !== captchaAnswer) {
      setToast("❌ Please solve the Captcha correctly.");
      generateCaptcha();
      return;
    }

    setSaving(true);

    try {
      const ok = await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: role
      });

      if (ok) {
  setToast("✅ Registered! Please verify your email before login.");
  setSaving(false);

  setTimeout(() => {
    navigate("/login");
  }, 2000);
}
       else {
        setToast("❌ Registration failed! Email might already exist.");
        setSaving(false);
      }
    } catch (err) {
      setSaving(false);
      console.error("Registration error:", err);
      setToast("❌ Registration error: " + (err.message || "Unknown error"));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-3 pt-10 pb-10">
      <motion.form
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-10 flex flex-col gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onSubmit={onSubmit}
        aria-label="Register Form"
      >
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-2 inline-flex items-center text-sm text-green-800 hover:text-green-900"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-4xl font-extrabold text-green-700 mb-2">
            🌱 Create Your FarmConnect Account
          </h1>
          <p className="text-gray-600">
            Join a growing network of rural producers and conscious buyers.
          </p>
        </div>

        {/* Role Selection */}
        <div>
          <label className="block font-bold text-gray-800 mb-3">Select Your Role</label>
          <div className="flex gap-3 flex-wrap">
            {ROLE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                className={`flex-1 min-w-[120px] rounded-xl font-bold text-sm md:text-base px-4 py-3 shadow transition transform hover:scale-105 ${
                  role === opt.value
                    ? "bg-green-600 text-white ring-2 ring-green-800"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                aria-pressed={role === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3 text-center font-semibold">
            {ROLE_OPTIONS.find(r => r.value === role)?.desc}
          </p>
          <p className="text-xs text-gray-500 mt-1 text-center">
            Your role helps us personalize your actions, insights, and recommendations.
          </p>
        </div>

        {/* Name Input */}
        <label className="flex flex-col">
          <span className="font-bold text-gray-800 mb-2">👤 Full Name</span>
          <input
            ref={firstInput}
            className={`px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
              errors.name
                ? "border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200"
            }`}
            type="text"
            placeholder="John Doe"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            autoFocus
          />
          {errors.name && (
            <div className="form-error text-red-600 text-sm mt-1 font-semibold">
              {errors.name}
            </div>
          )}
        </label>

        {/* Email Input */}
        <label className="flex flex-col">
          <span className="font-bold text-gray-800 mb-2">📧 Email</span>
          <input
            className={`px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
              errors.email
                ? "border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200"
            }`}
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            autoComplete="email"
          />
          {errors.email && (
            <div className="form-error text-red-600 text-sm mt-1 font-semibold">
              {errors.email}
            </div>
          )}
        </label>

        {/* Password Input */}
        <label className="flex flex-col">
          <span className="font-bold text-gray-800 mb-2">🔐 Password</span>
          <input
            className={`px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
              errors.password
                ? "border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200"
            }`}
            type={showPwd ? "text" : "password"}
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            autoComplete="new-password"
          />
          <PasswordStrength value={form.password} />
          {errors.password && (
            <div className="form-error text-red-600 text-sm mt-1 font-semibold">
              {errors.password}
            </div>
          )}
        </label>

        {/* Confirm Password Input */}
        <label className="flex flex-col">
          <span className="font-bold text-gray-800 mb-2">🔐 Confirm Password</span>
          <input
            className={`px-4 py-3 border-2 rounded-lg focus:outline-none transition ${
              errors.confirm
                ? "border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200"
            }`}
            type={showPwd ? "text" : "password"}
            placeholder="••••••••"
            value={form.confirm}
            onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
            autoComplete="new-password"
          />
          {errors.confirm && (
            <div className="form-error text-red-600 text-sm mt-1 font-semibold">
              {errors.confirm}
            </div>
          )}
        </label>

        {/* Captcha */}
        <div className="mt-2">
          <span className="font-bold text-gray-800 mb-2 block">🧩 Captcha Verification</span>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-lg bg-green-100 font-bold text-green-800">
              {captchaQuestion}
            </div>
            <button
              type="button"
              className="text-xs underline text-green-700 hover:text-green-900"
              onClick={generateCaptcha}
            >
              Refresh
            </button>
          </div>
          <input
            className="mt-2 px-4 py-2 border-2 rounded-lg focus:outline-none border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200"
            type="text"
            placeholder="Enter answer"
            value={captchaInput}
            onChange={e => setCaptchaInput(e.target.value)}
          />
        </div>

        {/* Show/Hide Password */}
        <button
          type="button"
          className="text-sm underline text-right text-green-700 hover:text-green-900 font-semibold"
          onClick={() => setShowPwd(v => !v)}
        >
          {showPwd ? "👁️ Hide" : "👁️ Show"} Passwords
        </button>

        {/* Submit Button - uses success variant from AnimatedButton */}
        <AnimatedButton
          type="submit"
          color="success"
          loading={saving}
          disabled={saving}
          className="w-full font-extrabold tracking-wide"
        >
          {saving ? "Creating Account..." : "✓ Create Account"}
        </AnimatedButton>

        {/* Login Link */}
        <div className="text-center pt-2 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="underline text-blue-700 font-bold hover:text-blue-900">
            Sign in here
          </Link>
        </div>

        {/* Terms */}
        <div className="text-center text-xs text-gray-500">
          By registering, you agree to our{" "}
            <Link to="/terms" className="text-blue-600 hover:underline">
              Terms & Conditions
            </Link>
          .
        </div>
      </motion.form>

      {/* Toast */}
      <AnimatePresence>
        {(toast || authError) && (
          <motion.div
            className={`fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 rounded-lg shadow-2xl p-4 border-l-4 font-semibold ${
              authError
                ? "bg-red-50 border-red-600 text-red-800"
                : "bg-white border-green-600 text-green-800"
            }`}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 25 }}
          >
            {toast || authError}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
