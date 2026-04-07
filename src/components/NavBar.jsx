import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedButton from "./AnimatedButton.jsx";
import { useAuth } from "../context/AuthContext";
/**
 * NavBar.jsx
 * - Top navigation for all public pages
 * - Animated links, mobile hamburger, branding, login/CTA slot
 * - Customizable extra links and button
 */

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Marketplace" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" }
];

export default function NavBar({ cta, extraLinks = [] }){
  const location = useLocation();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = React.useState(false);
  const { user, logout } = useAuth();

  function handleNav(to) {
    setNavOpen(false);
    navigate(to);
  }

  return (
    <nav className="w-full flex items-center justify-between px-7 py-5 shadow bg-white/85 border-b-2 border-green-50 relative z-50">
      {/* Brand/logo */}
      <div className="flex items-center gap-4">
        <img
          src="https://img.freepik.com/free-vector/hand-drawn-farmers-market-logo_23-2149329268.jpg?semt=ais_hybrid&w=740&q=80"
          alt="logo"
          className="w-10 h-10 rounded-xl shadow"
        />
        <span className="font-black text-2xl text-green-900">
          FarmConnect
        </span>
      </div>

      {/* Desktop nav */}
      <div className="hidden md:flex gap-6 items-center ml-4">
        {[...NAV_LINKS, ...extraLinks].map(l => (
          <Link
            key={l.to}
            to={l.to}
            className={`font-bold px-2 py-1 rounded transition text-lg hover:text-orange-800 ${
              location.pathname === l.to ? "text-green-900" : "text-green-700"
            }`}
            onClick={() => handleNav(l.to)}
          >
            {l.label}
          </Link>
        ))}
        {cta}
        {user ? (
          <>
            <span className="font-bold text-green-800 ml-5">
              {user.name}
            </span>
            <AnimatedButton
              label="Sign Out"
              color="secondary"
              size="sm"
              onClick={logout}
            />
          </>
        ) : (
          <AnimatedButton
            label="Sign In"
            color="success"   // green text & light bg from AnimatedButton
            size="sm"
            onClick={() => navigate("/login")}
          />
        )}
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed right-2 top-5 z-[80] bg-green-100 hover:bg-green-200 transition rounded-lg px-2 py-1.5"
        onClick={() => setNavOpen(o => !o)}
        aria-label="Open Navigation"
      >
        ≡
      </button>

      <AnimatePresence>
        {navOpen && (
          <motion.div
            className="fixed inset-0 bg-white/90 flex flex-col gap-8 p-10 pt-24 z-[100] shadow"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
          >
            {[...NAV_LINKS, ...extraLinks].map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`font-black text-2xl px-2 py-3 transition rounded hover:text-orange-700 ${
                  location.pathname === l.to
                    ? "text-green-900"
                    : "text-green-600"
                }`}
                onClick={() => handleNav(l.to)}
              >
                {l.label}
              </Link>
            ))}
            {cta}
            <div className="mt-8">
              {user ? (
                <>
                  <span className="font-bold text-green-800 block mb-3">
                    {user.name}
                  </span>
                  <AnimatedButton
                    label="Sign Out"
                    color="secondary"
                    size="lg"
                    onClick={logout}
                  />
                </>
              ) : (
                <AnimatedButton
                  label="Sign In"
                  color="success"  // same green text variant on mobile
                  size="lg"
                  onClick={() => navigate("/login")}
                />
              )}
            </div>
            <button
              className="fixed top-5 right-4 text-2xl"
              onClick={() => setNavOpen(false)}
              aria-label="Close Nav"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
