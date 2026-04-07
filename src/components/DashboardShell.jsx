import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AnimatedButton from "./AnimatedButton.jsx";

/**
 * DashboardShell.jsx
 * - Outer shell for all dashboard pages
 * - Provides sidebar, top bar, slot for main content, branding, logout, etc.
 * - Responsive for mobile (drawer), easily themed
 */

const SIDEBAR_LINKS = [
  { to: "/dashboard", icon: "🛒", label: "Marketplace" },
  { to: "/orders", icon: "📦", label: "Orders" },
  { to: "/cart", icon: "🛍️", label: "Cart" },
  { to: "/profile", icon: "👤", label: "Profile" }
];

export default function DashboardShell({ children, user, onLogout, extraLinks = [] }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = React.useState(false);

  function handleNav(to) {
    setNavOpen(false);
    navigate(to);
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-gradient-to-br from-[#f5fff8] to-[#fffbe5]">
      {/* Top bar */}
      <motion.div className="flex w-full gap-5 items-center px-8 py-5 shadow bg-green-50/80 justify-between">
        <div className="flex gap-6 items-center">
          <button
            className="md:hidden rounded bg-green-100 px-3 py-2 text-xl font-bold"
            onClick={() => setNavOpen(o=>!o)}
            aria-label="Open navigation"
          >
            ≡
          </button>
          <img src="/assets/logo-icon.svg" className="w-9 h-9 rounded-xl shadow" alt="logo"/>
          <span className="font-black text-2xl text-green-900">FarmConnect</span>
        </div>
        <div className="flex gap-5 items-center">
          <span className="font-medium text-green-900">{user?.name || "Welcome!"}</span>
          <AnimatedButton color="secondary" size="sm" label="Logout" onClick={onLogout || (()=>navigate("/login"))} />
        </div>
      </motion.div>
      {/* Sidebar/menu - desktop and modal drawer */}
      <aside className={`fixed md:static z-30 top-0 left-0 h-full bg-white shadow-xl md:shadow-none transition-all duration-300
        ${navOpen ? "w-56 opacity-100" : "w-0 md:w-52 opacity-0 md:opacity-100"}`}>
        <nav className="flex flex-col gap-2 py-14 px-6">
          {[...SIDEBAR_LINKS, ...extraLinks].map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`flex gap-5 items-center text-lg font-bold px-5 py-3 rounded-xl transition
                ${location.pathname.startsWith(l.to) ? "bg-green-200 text-green-900" : "text-green-700 hover:bg-green-50"}
              `}
              onClick={()=>handleNav(l.to)}
            >
              <span className="text-2xl">{l.icon}</span> {l.label}
            </Link>
          ))}
        </nav>
      </aside>
      {/* Main content */}
      <main className="flex-1 min-h-[600px] md:ml-52 flex flex-col p-7 pt-12 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
