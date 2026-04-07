import React from "react";
import { motion } from "framer-motion";

/**
 * FeaturesGrid.jsx
 * - Grid of feature cards, icons + label + description
 * - For homepage, about, or dashboard
 * - Animated and easy to style/add more items
 */

const FEATURES = [
  {
    icon: "🌱",
    label: "Genuine Rural Goods",
    desc: "All products are listed directly by certified rural farmers—no middlemen."
  },
  {
    icon: "🔒",
    label: "Secure Checkout",
    desc: "Payments protected with 256-bit encryption and leading banking partners."
  },
  {
    icon: "💬",
    label: "Community Feedback",
    desc: "Every buyer and seller is verified, and reviews are screened for honesty."
  },
  {
    icon: "🚚",
    label: "Nationwide Delivery",
    desc: "We ship to all major cities and rural areas—track every parcel live."
  },
  {
    icon: "📦",
    label: "Sustainable Packaging",
    desc: "Eco-friendly packaging ensures freshness, safety, and minimal waste."
  },
  {
    icon: "💡",
    label: "Farmer Learning Hub",
    desc: "Training, certification, and support for all sellers—everyone grows."
  }
];

export default function FeaturesGrid({ features = FEATURES }) {
  return (
    <section className="w-full py-20 bg-gradient-to-br from-[#ffeede] to-[#e9ffe8]">
      <h2 className="text-3xl font-bold text-green-900 text-center mb-10">Why Choose FarmConnect?</h2>
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 px-5">
        {features.map((f,i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 * i, type: "spring", stiffness: 115 }}
            className="rounded-2xl bg-white/80 shadow-xl border border-green-50 flex flex-col gap-3 items-center p-10 hover:scale-105 hover:bg-green-50/80 transition"
          >
            <span className="text-4xl mb-3">{f.icon}</span>
            <span className="font-bold text-xl text-green-800 mb-1">{f.label}</span>
            <span className="text-gray-600 text-center">{f.desc}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
