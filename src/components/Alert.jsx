import React from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Alert.jsx
 * - General purpose alert/notification info box
 * - Props: show, type, message, onClose, timeout, icon, children
 * - Animated, visually branded for all alert types
 */

const alertConfig = {
  info:   { color: "bg-blue-50 border-blue-500 text-blue-900", icon: "ℹ️" },
  success:{ color: "bg-green-50 border-green-500 text-green-900", icon: "✅" },
  warning:{ color: "bg-yellow-50 border-yellow-500 text-yellow-900", icon: "⚠️" },
  error:  { color: "bg-red-50 border-red-500 text-red-900", icon: "❌" }
};

export default function Alert({
  show = false,
  type = "info",
  message = "",
  onClose,
  timeout = 2700,
  icon,
  children
}) {
  React.useEffect(() => {
    if (!show || !onClose) return;
    if (timeout > 0) {
      const t = setTimeout(onClose, timeout);
      return () => clearTimeout(t);
    }
  }, [show, onClose, timeout]);

  const config = alertConfig[type] || alertConfig["info"];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`fixed left-1/2 top-8 -translate-x-1/2 shadow-xl rounded-xl p-5 font-bold border-2 z-[200] flex items-center gap-3 text-lg ${config.color}`}
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -25 }}
          role="alert"
          aria-live="assertive"
        >
          <span className="text-2xl">{icon ?? config.icon}</span>
          <span>{message}{children}</span>
          {onClose && (
            <button className="ml-5 px-2 rounded bg-gray-200 hover:bg-red-100" onClick={onClose} aria-label="Dismiss">✕</button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
