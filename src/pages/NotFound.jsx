import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AnimatedButton from "../components/AnimatedButton.jsx";

/**
 * NotFound.jsx (404)
 * - Modern, animated, lively error page for unmatched routes
 * - Suggests navigation, brand colors, and professional
 **/

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-bl from-[#fffbe7] to-[#eaf8ff] px-4">
      <motion.div
        initial={{ y: 66, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col items-center mb-20"
      >
        <motion.img
          src="/assets/404-tractor.svg"
          alt="Page Not Found"
          className="w-80 max-w-full mb-8 drop-shadow-2xl"
          initial={{ scale: 0.78, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 0.8 }}
        />
        <h1 className="text-5xl font-extrabold text-green-900 mb-4 text-center">404</h1>
        <h2 className="text-2xl font-bold text-orange-500 mb-6 text-center">Oops! This page doesn't exist...</h2>
        <p className="mb-8 text-gray-700 text-center text-lg">
          The page you're looking for might have been moved or deleted, <br/>
          or you may have followed a broken link.<br/>
          Let’s get you back home!
        </p>
        <div className="flex gap-5">
          <AnimatedButton
            color="primary"
            size="lg"
            label="Go to Home"
            onClick={()=>navigate("/")}
          />
          <AnimatedButton
            color="secondary"
            size="lg"
            label="Contact Support"
            onClick={()=>alert("Contact support at support@farmconnect.com")}
          />
        </div>
      </motion.div>
    </div>
  );
}
