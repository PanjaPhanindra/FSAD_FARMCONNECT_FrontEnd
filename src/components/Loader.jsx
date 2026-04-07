import React from "react";
import { motion } from "framer-motion";

/**
 * Loader.jsx
 * - Flexible: use for global spinner, card shimmer, skeleton, dots, etc.
 * - Configurable via props
 * - Animations: pulse, rotate, glow, shimmer
 * - For use in every page and modal for better feedback and polish
 **/

export default function Loader({
  type = "spinner", // spinner | dots | shimmer | circle | bar
  size = 34,
  color = "#62D79E",
  style = {},
  className = "",
  label = "Loading...",
  ...props
}) {
  // Return animated SVG spinner (default)
  if (type === "spinner") {
    return (
      <motion.div
        className={"flex flex-col items-center justify-center " + className}
        style={{ minHeight: size + 18, ...style }}
        {...props}
      >
        <motion.svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="block"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.05, ease: "linear" }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2.4}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeDasharray="66"
            strokeDashoffset="0"
            strokeLinecap="round"
            opacity="0.22"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2.4}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeDasharray="38"
            strokeDashoffset="30"
            strokeLinecap="round"
            initial={{ pathLength: 0.1 }}
            animate={{ pathLength: 1 }}
            transition={{ repeat: Infinity, duration: 1.11, ease: "easeInOut" }}
          />
        </motion.svg>
        <span className="text-green-800 mt-2 text-base animate-pulse">{label}</span>
      </motion.div>
    );
  }

  // Dots loader
  if (type === "dots") {
    return (
      <div className={"flex space-x-2 justify-center " + className} style={{ ...style }} {...props}>
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            className="inline-block rounded-full bg-lime-400"
            style={{ width: size / 3, height: size / 3 }}
            animate={{ y: [0, -9, 0] }}
            transition={{ repeat: Infinity, delay: i * 0.22, duration: 0.85, ease: "easeInOut" }}
          />
        ))}
        <span className="text-green-800 ml-4 text-base animate-pulse">{label}</span>
      </div>
    );
  }

  // Shimmer/skeleton (e.g., card or list)
  if (type === "shimmer") {
    return (
      <div className={"w-full h-full rounded-2xl bg-gradient-to-r from-green-100 via-gray-100 to-green-50 animate-pulse " + className} style={style}></div>
    );
  }

  // Animated Circle
  if (type === "circle") {
    return (
      <motion.div
        className={"flex items-center justify-center rounded-full border-4 border-green-100 shadow-lg " + className}
        style={{ width: size * 2, height: size * 2, ...style }}
        animate={{ scale: [0.95, 1.12, 0.95] }}
        transition={{ repeat: Infinity, duration: 1.5, type: "tween", ease: "easeInOut" }}
        {...props}
      >
        <span className="bg-green-300 w-6 h-6 rounded-full block"></span>
      </motion.div>
    );
  }

  // Progress bar loader
  if (type === "bar") {
    return (
      <motion.div className={"w-full h-3 rounded-xl bg-green-100 mt-3 overflow-hidden "+className}>
        <motion.div className="h-full rounded-xl bg-gradient-to-r from-green-400 to-green-700"
          animate={{ width: ["12%","46%","94%","12%"] }}
          transition={{ repeat: Infinity, duration: 2.8, repeatType: "loop" }}
        />
      </motion.div>
    );
  }

  // Fallback: static loading...
  return (
    <div className={"font-bold text-green-800 "+className} style={style}>
      Loading...
    </div>
  );
}
