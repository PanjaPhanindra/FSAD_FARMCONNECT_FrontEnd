import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AnimatedButton from "./AnimatedButton.jsx";

/**
 * Hero.jsx
 * - Jumbotron/landing hero for homepage
 * - Attention-grabbing, animated, responsive
 * - Branded illustration/graphic, value-prop, CTAs
 */

export default function Hero({
  title = "Fresh from Village to Home",
  subtitle = "India’s #1 Rural Farmer Marketplace. Order direct, support our land, and taste the difference.",
  cta1 = "Shop Now",
  cta2 = "Become a Seller",
  img = "/assets/hero-illustration.svg"
}) {
  const navigate = useNavigate();
  return (
    <section className="w-full pt-20 pb-16 md:pb-28 bg-gradient-to-br from-[#ddffee] to-[#fffee4] flex flex-col md:flex-row items-center justify-between">
      {/* Image or illustration */}
      <motion.img
        src={img}
        alt="Hero illustration"
        className="w-[340px] md:w-[440px] mb-10 md:mb-0 ml-0 md:ml-16 rounded-2xl drop-shadow-2xl border-4 border-green-100"
        initial={{ opacity: 0, scale: 0.91, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 1.1 }}
      />
      {/* Text/CTAs */}
      <motion.div
        className="flex-1 flex flex-col items-center md:items-start pl-5 md:pl-0"
        initial={{ opacity: 0, x: 44 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", duration: 1.13 }}
      >
        <h1 className="text-4xl md:text-6xl font-extrabold text-green-900 mb-5 text-center md:text-left">{title}</h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-green-700 mb-7 text-center md:text-left">{subtitle}</h2>
        <div className="flex gap-6 mt-4 mb-1 flex-wrap justify-center md:justify-start">
          <AnimatedButton label={cta1} color="primary" size="lg" onClick={()=>navigate("/dashboard")}/>
          <AnimatedButton label={cta2} color="secondary" size="lg" onClick={()=>navigate("/register?seller=1")}/>
        </div>
      </motion.div>
    </section>
  );
}
