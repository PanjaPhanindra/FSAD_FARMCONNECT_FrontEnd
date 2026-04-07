import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Modal.jsx
 * - Universal, animated, accessible modal utility for all pages
 * - Use for: confirm, info, forms, alerts, or just as dialog wrapper
 * - Props: open, onClose, children, title, icon, showClose, width, etc.
 */

export default function Modal({
  open,
  onClose,
  children,
  title,
  icon,
  showClose = true,
  width = "max-w-lg",
  className = "",
  initialFocus, // a ref to put focus in modal first
  ...props
}) {
  const ref = useRef();

  // Focus management for accessibility
  useEffect(() => {
    if (open && initialFocus && initialFocus.current) {
      initialFocus.current.focus();
    } else if (open && ref.current) {
      ref.current.focus();
    }
  }, [open, initialFocus]);

  // Escape key to close
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === "Escape") onClose && onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-bg z-[150]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          tabIndex={-1}
          onClick={onClose}
          {...props}
        >
          <motion.div
            ref={ref}
            className={`modal-content ${width} ${className}`}
            tabIndex={0}
            initial={{ scale: 0.96, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 20, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
            onKeyDown={e => e.key === "Escape" && onClose && onClose()}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                {icon && <span className="text-2xl">{icon}</span>}
                {title && <h4 id="modal-title" className="font-bold text-lg text-green-900">{title}</h4>}
              </div>
              {showClose && (
                <button className="bg-gray-100 px-2 py-1.5 rounded-full hover:bg-red-50" onClick={onClose} aria-label="Close modal">✕</button>
              )}
            </div>
            <div>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
