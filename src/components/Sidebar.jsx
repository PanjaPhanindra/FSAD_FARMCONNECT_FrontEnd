import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * Sidebar.jsx
 * - Persistent/fixed navigation for dashboard/admin
 * - Shows avatar, nav links, responsive expand/collapse, role-based links
 * - Highly customizable and revisable
 */

const DEFAULT_LINKS = [
  { to: "/dashboard", icon: "🏠", label: "Dashboard" },
  { to: "/orders", icon: "📦", label: "Orders" },
  { to: "/cart", icon: "🛒", label: "Cart" },
  { to: "/profile", icon: "👤", label: "Profile" }
];

const ADMIN_LINKS = [
  { to: "/admin/users", icon: "🛡️", label: "Users" },
  { to: "/admin/transactions", icon: "💸", label: "Transactions" },
  { to: "/admin/disputes", icon: "⚖️", label: "Disputes" }
];

const SELLER_LINKS = [
  { to: "/seller/products", icon: "🥕", label: "My Products" },
  { to: "/seller/add", icon: "➕", label: "Add Product" },
  { to: "/seller/orders", icon: "📦", label: "Seller Orders" }
];

export default function Sidebar({
  user = {},
  links,
  collapsed,
  onCollapse,
  footer,
  className = ""
}) {
  const location = useLocation();
  const [isCollapsed, setCollapsed] = React.useState(collapsed || false);

  // Select links by role
  let navLinks = links;
  if (!navLinks) {
    if (user.role === "admin") navLinks = [...DEFAULT_LINKS, ...ADMIN_LINKS];
    else if (user.role === "seller") navLinks = [...DEFAULT_LINKS, ...SELLER_LINKS];
    else navLinks = [...DEFAULT_LINKS];
  }

  function toggleCollapse() {
    setCollapsed(c => !c);
    if (onCollapse) onCollapse(!isCollapsed);
  }

  return (
    <aside className={`h-screen bg-white shadow-xl border-r border-green-100 flex flex-col pt-2 ${isCollapsed ? "w-20" : "w-60"} transition-all duration-300 ${className}`}>
      <div className="flex items-center gap-3 p-4">
        <img src={user.avatarUrl || "/assets/avatar-guest.png"} className="w-12 h-12 rounded-full border" alt="avatar"/>
        {!isCollapsed && (
          <div>
            <div className="font-bold text-green-900">{user.name || "Guest"}</div>
            <div className="text-sm text-gray-500">{user.role || "User"}</div>
          </div>
        )}
        <button
          className="ml-auto rounded-full py-1 px-2 bg-green-100 hover:bg-orange-100"
          onClick={toggleCollapse} aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? "⮞" : "⮜"}
        </button>
      </div>
      <nav className="flex-1 flex flex-col gap-1.5 mt-5">
        {navLinks.map(l => (
          <Link
            key={l.to}
            to={l.to}
            className={`flex items-center gap-4 px-6 py-3 text-lg font-bold rounded-r-2xl transition
              ${location.pathname.startsWith(l.to) ? "bg-green-200 text-green-800" : "text-green-700 hover:bg-green-50"}
              ${isCollapsed ? "justify-center px-3" : ""}
            `}
            tabIndex={0}
            aria-current={location.pathname.startsWith(l.to) ? "page" : undefined}
          >
            <span className="text-2xl">{l.icon}</span>
            {!isCollapsed && l.label}
          </Link>
        ))}
      </nav>
      {footer && <div className="mt-auto p-4">{footer}</div>}
    </aside>
  );
}
