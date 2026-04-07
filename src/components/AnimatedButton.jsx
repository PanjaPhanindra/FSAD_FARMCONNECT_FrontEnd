import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * AnimatedButton.jsx
 * - Used for navigation, actions everywhere (CTA, forms, popups, nav, etc)
 * - Multi-format: as <Link>, as <button>, can be used for modals, forms, etc.
 * - Fully animated: color, tap, hover, grow/shrink, ripple
 * - Configurable: color, size, loading, icon left/right, tooltip, full width, disables, accessibility
 * - Keyboard-accessible, a11y
 * - In production, you can extend for dropdowns, split buttons, file inputs, etc.
 */

// Button color schemes (gradient or normal)
const colors = {
  primary:
    "from-green-400 to-green-700 text-white border-green-600 hover:from-lime-400 hover:to-green-800",
  secondary:
    "from-orange-200 to-yellow-300 text-green-800 border-orange-300 hover:from-yellow-200 hover:to-orange-400",
  danger:
    "from-red-400 to-red-700 text-white border-red-600 hover:from-red-200 hover:to-red-700",
  outline:
    "bg-white text-green-600 border-green-400 hover:bg-green-50",

  // ✅ New: for dark green text on light background (use this for Create Account)
  success:
    "bg-green-100 text-green-900 border-green-500 hover:bg-green-200",
};

// Loading spinner SVG (tuned for both light/dark, inherits currentColor)
const loadingSpinner = (
  <svg
    className="animate-spin mr-2 h-5 w-5 inline-block text-current"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-30"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v8H4z"
    />
  </svg>
);

export default function AnimatedButton({
  to,
  label,
  children,
  color = "primary",
  size = "md",
  icon,
  rightIcon,
  tooltip,
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  className = "",
  type = "button",
  ...props
}) {
  // Ripple effect for realistic visual delight
  const btnRef = useRef(null);

  useEffect(() => {
    if (!btnRef.current) return;
    const btn = btnRef.current;
    const rippleHandler = e => {
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.left = e.clientX - btn.getBoundingClientRect().left + "px";
      ripple.style.top = e.clientY - btn.getBoundingClientRect().top + "px";
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 670);
    };
    btn.addEventListener("mousedown", rippleHandler);
    return () => btn.removeEventListener("mousedown", rippleHandler);
  }, []);

  // Sizing helper
  let sizeStyles = "text-base px-7 py-2";
  if (size === "lg") sizeStyles = "text-xl px-8 py-3";
  if (size === "sm") sizeStyles = "text-sm px-3 py-1.5";

  const base =
    `relative overflow-hidden inline-flex items-center gap-3 rounded-xl font-bold shadow-lg border-2 transition-all duration-200 select-none ` +
    (colors[color] || colors.primary) +
    ` ` +
    sizeStyles +
    (disabled
      ? " opacity-60 cursor-not-allowed"
      : " hover:scale-105 hover:brightness-110 active:scale-95 active:brightness-90") +
    (fullWidth ? " w-full justify-center" : "") +
    " " +
    className;

  // Button content
  const inner = (
    <>
      {loading ? loadingSpinner : icon}
      <span className={loading ? "opacity-70 ml-1" : ""}>
        {label || children}
      </span>
      {rightIcon}
      {/* Ripple effect element */}
      <span
        className="absolute inset-0 pointer-events-none rounded-xl"
        aria-hidden="true"
        style={{ zIndex: 5 }}
      ></span>
    </>
  );

  // Animate tap and hover, allow Link or normal <button>
  const btnProps = {
    ref: btnRef,
    className: base,
    tabIndex: disabled ? -1 : 0,
    "aria-disabled": disabled,
    "aria-label": props["aria-label"] || label,
    style: { borderRadius: "1rem", ...props.style },
    ...props,
  };

  // Tooltip support via title, or custom
  if (tooltip) btnProps.title = tooltip;

  // Link variant for navigation
  if (to) {
    return (
      <motion.span
        whileHover={!disabled ? { scale: 1.07 } : {}}
        whileTap={!disabled ? { scale: 0.94 } : {}}
        drag={false}
        className="inline-block"
      >
        <Link to={to} {...btnProps}>
          {inner}
        </Link>
      </motion.span>
    );
  }
  // Button variant
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.07 } : {}}
      whileTap={!disabled ? { scale: 0.96 } : {}}
      drag={false}
      disabled={disabled || loading}
      type={type}
      onClick={disabled || loading ? undefined : onClick}
      {...btnProps}
    >
      {inner}
      {/* For focus/outline accessibility */}
      <span className="sr-only">{label}</span>
    </motion.button>
  );
}

// Additional ripple effects
const style = document.createElement("style");
style.innerHTML = `
.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(182,255,190,0.45);
  transform: scale(0);
  animation: ripple-animate .67s linear;
  pointer-events: none;
  z-index: 7;
  width: 65px;
  height: 65px;
  left: 0; top: 0;
  display: block;
}
@keyframes ripple-animate {
  to { transform: scale(3.2); opacity: 0; }
}`;
if (typeof document !== "undefined" && !document.getElementById("ripple-style")) {
  style.id = "ripple-style";
  document.head.appendChild(style);
}
