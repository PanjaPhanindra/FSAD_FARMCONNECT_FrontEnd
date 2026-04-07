import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * Footer.jsx
 * - Professional, vivid, animated footer for full site branding
 * - Includes logo, navigation links, social, and copyright
 * - Responsive and accessible
 */

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Marketplace" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" }
];

// Fill in with your actual links for privacy/terms if you wish
const infoLinks = [
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Terms" }
];

const socials = [
  { label: "Twitter", href: "#", icon: "🐦" },
  { label: "Facebook", href: "#", icon: "📘" },
  { label: "Instagram", href: "#", icon: "📸" }
];

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-br from-[#e0ffe6] to-[#fffbe7] pt-16 pb-12 mt-12 border-t-4 border-green-100">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center px-8 gap-8">
        {/* Brand/logo */}
        <motion.div
          className="flex gap-4 items-center"
          initial={{ x: -24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <img src="https://img.freepik.com/free-vector/hand-drawn-farmers-market-logo_23-2149329268.jpg?semt=ais_hybrid&w=740&q=80" alt="logo" className="w-12 h-12 rounded-xl shadow"/>
          <span className="font-bold text-2xl text-green-800">FarmConnect</span>
        </motion.div>
        {/* Navigation */}
        <nav className="flex gap-7 pt-3">
          {navLinks.map(n => (
            <Link
              key={n.label}
              to={n.to}
              className="text-green-800 hover:text-orange-500 font-semibold text-lg transition underline-offset-4 hover:underline"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        {/* Social */}
        <div className="flex flex-col items-center gap-2 pt-4 md:pt-0">
          <span className="uppercase text-xs font-bold text-green-500 tracking-widest mb-1">Follow Us</span>
          <div className="flex gap-3">
            {socials.map(s => (
              <motion.a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center shadow-lg hover:bg-orange-100 transition"
                whileHover={{ scale: 1.16, rotate: -10 }}
                title={s.label}
              >
                <span className="text-lg">{s.icon}</span>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
      {/* Info/bottom row */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center pt-7 mt-7 px-8 border-t border-green-50">
        <div className="text-gray-600 text-sm">&copy; {new Date().getFullYear()} FarmConnect. All rights reserved.</div>
        <div className="flex gap-6 pt-3 md:pt-0">
          {infoLinks.map(n=>(
            <a key={n.label} href={n.href} className="text-green-700 underline hover:text-orange-400 text-xs">{n.label}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}
