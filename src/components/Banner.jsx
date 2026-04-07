import React from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Banner.jsx
 * - Animated, branded site/global announcement, alert or feature promo
 * - Props: show, type, message, icon, color, actions[]
 * - Dismissible and can auto-hide if desired
 */

const colorMap = {
  info:    "bg-blue-100 text-blue-900",
  success: "bg-green-100 text-green-900",
  warning: "bg-yellow-100 text-yellow-900",
  error:   "bg-red-100 text-red-900"
};

export default function Banner({
  show = false,
  type = "info",
  message = "",
  icon,
  children,
  dismissible = true,
  onClose,
  actions = [],
  autoHide = 0 // ms; set to >0 for timed banner
}) {
  React.useEffect(() => {
    if (autoHide > 0 && show && onClose) {
      const t = setTimeout(onClose, autoHide);
      return () => clearTimeout(t);
    }
  }, [show, autoHide, onClose]);
  const color = colorMap[type] || colorMap.info;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`w-full fixed top-0 left-0 z-[120] flex items-center justify-center py-3 shadow-md ${color}`}
          initial={{ opacity: 0, y: -26 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -26 }}
          role="status"
        >
          {icon && <span className="text-2xl mr-4">{icon}</span>}
          <span className="font-bold text-lg">{message}{children}</span>
          {actions.map((a,i) => (
            <button
              key={i}
              className={`ml-5 px-3 py-1 rounded bg-green-200 text-green-900 font-semibold hover:bg-orange-200 transition`}
              onClick={a.onClick}
            >{a.label}</button>
          ))}
          {dismissible && typeof onClose === "function" && (
            <button
              className="ml-6 px-3 py-1 text-lg bg-gray-200 rounded-full hover:bg-red-200 transition"
              aria-label="Close"
              onClick={onClose}
            >✕</button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
