import React from "react";
import { motion } from "framer-motion";

/**
 * Testimonials.jsx
 * - Animated review grid for home/about
 * - Flexible and branded, user images and text
 */

const TESTIMONIALS = [
  {
    user: "Sneha (Mumbai)",
    avatar: "/assets/avatar-buyer.png",
    text: "Buying from FarmConnect feels good. Quality is top notch, and the farmers are so helpful!"
  },
  {
    user: "Prakash (Nashik)",
    avatar: "/assets/avatar-seller.png",
    text: "Best thing for my grapes business in years. Got more fair orders in a month than all last year!"
  },
  {
    user: "Ritu (Bhopal)",
    avatar: "/assets/avatar-buyer.png",
    text: "I love the transparency. I can read all reviews and the prices are fair to farmers."
  },
  {
    user: "Arjun (Ahmedabad)",
    avatar: "/assets/avatar-seller.png",
    text: "Was easy to sign up and list my jaggery. Support team even helped optimize my images!"
  },
  {
    user: "Geeta (Bangalore)",
    avatar: "/assets/avatar-buyer.png",
    text: "The delivery is fast and everything tastes so fresh. My family’s new weekly shopping site."
  }
];

export default function Testimonials({ testimonials = TESTIMONIALS }) {
  return (
    <section className="w-full py-16 bg-gradient-to-br from-[#e7f6ff] to-[#fffbe4]">
      <h2 className="text-3xl font-bold text-green-900 text-center mb-10">What Our Users Say</h2>
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-9 px-4">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.user + i}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.13 * i, type: "spring", stiffness: 125 }}
            className="rounded-2xl bg-white/80 border shadow-xl flex flex-col gap-4 items-center p-8 hover:scale-105 hover:bg-green-50/80 transition"
          >
            <img src={t.avatar} alt={t.user} className="h-16 w-16 rounded-full shadow-lg border-2 border-green-50 mb-2" />
            <span className="italic text-gray-700 text-lg text-center px-1">"{t.text}"</span>
            <span className="text-green-800 font-bold py-2">{t.user}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
