import React from "react";
import { motion } from "framer-motion";

/**
 * Privacy.jsx
 * - Privacy Policy, animated, modern, readable for users
 * - For compliance and trust; links from footer/nav
 */

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-[#eaf7ff] to-[#fcffe2] pt-14 pb-24 px-3">
      <motion.section
        className="max-w-2xl mx-auto bg-white/98 rounded-3xl shadow-2xl p-10"
        initial={{ opacity: 0, y: 34 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl md:text-4xl font-black text-green-900 mb-5 text-center">Privacy Policy</h2>
        <div className="mb-8 text-gray-600 text-sm text-center">Effective date: 5 November 2025</div>
        <h3 className="text-lg font-bold text-green-800 mt-2">1. Personal Information</h3>
        <p className="mb-3 text-gray-700">
          FarmConnect collects only the data needed to provide our marketplace service: name, contact info, and product/order details. Passwords are securely hashed and never accessible even to staff.
        </p>
        <h3 className="text-lg font-bold text-green-800 mt-4">2. Data Use</h3>
        <ul className="list-disc ml-8 mb-3 text-gray-700">
          <li>We use your contact and listing details to power transactions.</li>
          <li>Personal information is never shared, sold, or rented to third parties without explicit consent—except for government/law enforcement compliance.</li>
        </ul>
        <h3 className="text-lg font-bold text-green-800 mt-4">3. Cookies & Analytics</h3>
        <p className="mb-3 text-gray-700">
          We use cookies for secure login and basic analytics to improve your experience; you may disable cookies but critical functionality (like checkout) may break.
        </p>
        <h3 className="text-lg font-bold text-green-800 mt-4">4. Account Control</h3>
        <ul className="list-disc ml-8 mb-3 text-gray-700">
          <li>All users may request data erasure, export, or account deletion directly via profile settings or through our support team.</li>
        </ul>
        <h3 className="text-lg font-bold text-green-800 mt-4">5. Security</h3>
        <p className="mb-3 text-gray-700">
          We maintain modern security practices, including encrypted connections and strict data access controls, to safeguard your information.
        </p>
        <h3 className="text-lg font-bold text-green-800 mt-4">6. Policy Updates</h3>
        <p>
          This policy may be updated from time to time. Substantive changes will be notified by email or site notice.
        </p>
        <div className="mt-9 text-gray-500 text-center text-xs">Questions? Contact us at privacy@farmconnect.com</div>
      </motion.section>
    </div>
  );
}
