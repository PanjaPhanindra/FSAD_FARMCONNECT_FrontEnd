import React, { useState, useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedButton from "../components/AnimatedButton.jsx";
import Loader from "../components/Loader.jsx";

/**
 * Login.jsx
 * - User login: email, password
 * - Animated form, accessible, with error/resume states
 * - Role-based dashboard redirection (admin, seller, buyer)
 * - Professional look, easy extension for OAuth/social etc.
 */

const loginAnimations = {
  initial: { opacity: 0, y: 25 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 25 }
};

export default function Login() {
  // Destructure all needed values from AuthContext ONCE at top level
  const { login, user, authError, clearAuthError } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [forgot, setForgot] = useState(false);
  const emailInput = useRef();

  useEffect(() => {
    emailInput.current && emailInput.current.focus();
    clearAuthError();
    setToast("");
  }, [clearAuthError]);

  // Validation
  const errors = {};
  if (!form.email || !form.email.includes("@"))
    errors.email = "Valid email required";
  if (!form.password) errors.password = "Enter password";

  // Submit handler with role-based redirection
  async function onSubmit(e) {
    e.preventDefault();
    // do NOT clearAuthError here, so login() can set it
    if (Object.keys(errors).length)
      return setToast("Please fix highlighted fields.");
    setSaving(true);

    const loggedUser = await login(form.email, form.password); // returns user or null
    setSaving(false);

    if (loggedUser) {
      setToast("Login successful! Redirecting…");
      setTimeout(() => {
        const role = loggedUser.role?.toLowerCase();

        if (role === "admin") {
          navigate("/admin-dashboard");
        } else if (role === "seller" || role === "farmer") {
          navigate("/seller-dashboard");
        } else if (role === "buyer") {
          navigate("/buyer-dashboard");
        } else {
          navigate("/");
        }
      }, 950);
    } else {
      // WRONG CREDENTIALS CASE – show proper message from context
      setTimeout(() => {
  setToast("Invalid email or password.");
}, 100);
    }
  }

  // Forgot password simulation
  async function handleForgot(e) {
  e.preventDefault();

  if (!form.email || !form.email.includes("@")) {
    setToast("❌ Enter valid email first");
    return;
  }

  setForgot(true);

  try {
    const res = await fetch(
      `http://localhost:8080/auth/forgot-password?email=${form.email}`,
      {
        method: "POST"
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setToast("❌ " + (data.message || "Failed"));
    } else {
      setToast("✅ Reset email sent. Check your inbox.");
    }

  } catch (err) {
    setToast("❌ Server error");
  }

  setForgot(false);
}

  //---------------------------

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#d7fff6] to-[#ebffef] px-3 pt-12">
      <motion.form
        className="w-full max-w-md bg-white/90 rounded-3xl shadow-2xl p-10 flex flex-col gap-5"
        {...loginAnimations}
        onSubmit={onSubmit}
        aria-label="Login Form"
      >
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-3 inline-flex items-center text-sm text-green-800 hover:text-green-900"
        >
          ← Back
        </button>

        <h2 className="text-2xl md:text-3xl font-extrabold text-green-900 mb-1">
          Sign In
        </h2>

        <label>
          Email
          <input
            ref={emailInput}
            className={errors.email ? "error" : ""}
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            autoComplete="email"
            disabled={forgot}
          />
        </label>
        {errors.email && <div className="form-error">{errors.email}</div>}

        <label>
          Password
          <input
            className={errors.password ? "error" : ""}
            type={showPwd ? "text" : "password"}
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            autoComplete="current-password"
            disabled={forgot}
          />
        </label>
        {errors.password && (
          <div className="form-error">{errors.password}</div>
        )}

        <button
          type="button"
          className="text-xs underline text-right text-green-800 hover:text-orange-600 mb-2 select-none"
          onClick={() => setShowPwd(v => !v)}
        >
          {showPwd ? "Hide" : "Show"} Password
        </button>

        <div className="flex gap-4 items-center mt-2 mb-1">
          <button
  type="submit"
  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold"
  disabled={forgot}
>
  {saving ? "Logging in..." : "Login"}
</button>

          <button
            type="button"
            onClick={handleForgot}
            className="text-xs underline text-green-900 decoration-dotted hover:text-orange-500"
            disabled={forgot}
          >
            Forgot password?
          </button>
        </div>

        {/* Inline auth error */}
        {authError && (
          <p className="mt-1 text-sm font-semibold text-red-600">
            {authError}
          </p>
        )}

        <div className="text-center pt-1 text-sm">
          New user?{" "}
          <Link to="/register" className="underline text-blue-700">
            Create an account
          </Link>
        </div>
      </motion.form>

      {/* Toast/feedback for login */}
      <AnimatePresence>
        {(toast || authError || forgot) && (
          <motion.div className="toast" {...loginAnimations}>
            {forgot ? (
              <Loader label="Sending reset email..." />
            ) : (
              toast || authError
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
