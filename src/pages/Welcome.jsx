import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AnimatedButton from "../components/AnimatedButton.jsx";

/**
 * Welcome.jsx
 * - Landing/first entry page for new users, onboarding experience
 * - Animated, vivid, highlights key features
 * - Directs to registration/login/marketplace
 */

const HIGHLIGHTS = [
  {
    icon: "🍎",
    label: "Fresh from Farm",
    text: "Buy chemical-free produce from trusted rural suppliers."
  },
  {
    icon: "🧑‍🌾",
    label: "Empower Farmers",
    text: "Every order supports India's agricultural community directly."
  },
  {
    icon: "🛒",
    label: "Order & Track",
    text: "Simple shopping, fast delivery, and instant support."
  },
  {
    icon: "💬",
    label: "Community Reviews",
    text: "Verified user ratings and transparent feedback for all."
  }
];

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-[#fffbe8] to-[#e9fffa] pt-18 pb-24 px-4">
      <motion.section
        className="max-w-3xl mx-auto bg-white/98 rounded-3xl shadow-2xl p-12 mb-12 mt-5 flex flex-col items-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <img src="https://www.shutterstock.com/image-vector/farmer-labour-indian-agriculture-happy-260nw-2486843837.jpg" alt="FarmConnect Logo" className="h-16 w-16 mb-3 rounded-full shadow border-2 border-green-200"/>
        <h1 className="text-4xl md:text-5xl font-black text-green-900 mb-3 text-center">Welcome to FarmConnect!</h1>
        <p className="text-xl text-gray-700 mb-6 text-center">
          India’s trusted platform for direct farm-to-home delivery, empowering farmers and delighting buyers.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {HIGHLIGHTS.map((h,i) => (
            <motion.div
              key={h.label}
              className="flex gap-4 items-center bg-green-50/90 border-green-100 border rounded-xl p-5 shadow-lg"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * i }}
            >
              <span className="text-3xl">{h.icon}</span>
              <div>
                <div className="font-bold text-green-800 text-lg">{h.label}</div>
                <div className="text-gray-700">{h.text}</div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex gap-7 justify-center mt-3 flex-wrap">
          <AnimatedButton color="secondary" size="lg" label="Get Started" onClick={()=>navigate("/register")}/>
          <AnimatedButton color="secondary" size="lg" label="Sign In" onClick={()=>navigate("/login")}/>
          <AnimatedButton color="outline" size="lg" label="Take a Tour" onClick={()=>navigate("/about")}/>
        </div>
      </motion.section>
    </div>
  );
}
