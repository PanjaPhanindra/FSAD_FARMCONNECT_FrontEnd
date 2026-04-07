import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AnimatedButton from "../components/AnimatedButton.jsx";

/**
 * RoleSelect.jsx
 * - Pick a role before registration or login
 * - Buyer, Seller, Admin with explanations
 * - Animated selection cards, vivid UI, mobile-friendly
 * - Routes the user to the correct flow (registration or dashboard)
 */

const ROLES = [
  {
    value: "buyer",
    label: "Buyer",
    emoji: "🛒",
    desc: "Discover rural and organic goods, order directly, and support farming communities.",
    color: "bg-green-100 border-green-200 text-green-900"
  },
  {
    value: "seller",
    label: "Seller",
    emoji: "🧑‍🌾",
    desc: "Transform your farm’s output into verified products and reach buyers worldwide.",
    color: "bg-yellow-100 border-yellow-300 text-yellow-900"
  },
  {
    value: "admin",
    label: "Admin",
    emoji: "🛡️",
    desc: "Oversee platform health, quality, security, and help both buyers & sellers.",
    color: "bg-purple-100 border-purple-200 text-purple-900"
  }
];

export default function RoleSelect() {
  const navigate = useNavigate();

  // Choose role for registration or login
  const handleSelect = (role) => {
    // You can route with state or query param if you want pre-fill
    navigate(`/register`, { state: { preselect: role } });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#ffe4bb] to-[#dcffe4] py-14 px-5">
      <motion.div
        className="w-full max-w-3xl mx-auto bg-white/90 rounded-3xl shadow-2xl p-10 flex flex-col gap-9"
        initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
        transition={{ duration: 0.7, type: "spring" }}
      >
        <h2 className="text-3xl md:text-4xl font-extrabold text-green-900 text-center mb-6">Choose Your Role</h2>
        <div className="flex flex-col md:flex-row gap-8 justify-center">
          {ROLES.map(r => (
            <motion.div
              key={r.value}
              className={`flex-1 rounded-2xl shadow-lg cursor-pointer p-7 border-4 flex flex-col gap-4 items-center transition group ${r.color}`}
              whileHover={{ scale: 1.07, boxShadow: "0 20px 40px #a5f3fc38" }}
              tabIndex={0}
              aria-label={r.label}
              onClick={() => handleSelect(r.value)}
            >
              <span className="text-6xl">{r.emoji}</span>
              <span className="text-2xl font-bold mt-2">{r.label}</span>
              <span className="text-center text-base opacity-85">{r.desc}</span>
              <AnimatedButton
                label={`Sign up as ${r.label}`}
                color={r.value === "buyer" ? "primary" : r.value === "seller" ? "secondary" : "outline"}
                size="lg"
              />
            </motion.div>
          ))}
        </div>
        <div className="pt-7 text-center text-lg">
          Already have an account?{" "}
          <button className="underline text-blue-700 ml-1" onClick={() => navigate("/login")}>
            Sign In
          </button>
        </div>
      </motion.div>
    </div>
  );
}
