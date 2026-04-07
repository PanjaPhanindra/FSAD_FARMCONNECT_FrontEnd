import React from "react";
import { motion } from "framer-motion";

/**
 * DashboardCard.jsx
 * - For dashboards: displays count/metric with icon, label, and animated value
 * - For orders, earnings, users, stock, etc
 * - Highly styled, quick to extend with CTA/actions
 */

export default function DashboardCard({
  icon = "📦",
  label = "Orders",
  value = 0,
  unit = "",
  color = "bg-green-100 text-green-900",
  delta = null, // For increase/decrease arrows
  onClick,
  loading = false,
  children
}) {
  return (
    <motion.div
      className={`flex flex-col items-center justify-center rounded-3xl px-8 py-7 ${color} shadow-xl border-b-2 border-green-200 cursor-pointer hover:scale-105 transition`}
      whileHover={{ scale: 1.09 }}
      onClick={onClick}
      tabIndex={0}
      aria-label={label}
      initial={{ opacity: 0, y: 36 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", duration: 0.6 }}
    >
      <span className="text-4xl mb-2">{icon}</span>
      <span className="font-bold text-2xl mb-1">{loading ? "..." : value}{unit}</span>
      <span className="uppercase text-xs font-semibold text-green-700 mb-1">{label}</span>
      {delta && (
        <span className={`text-sm font-bold ${delta>0?'text-green-800':'text-red-600'}`}>
          {delta>0?"▲":"▼"} {Math.abs(delta)}%
        </span>
      )}
      <div>{children}</div>
    </motion.div>
  );
}
