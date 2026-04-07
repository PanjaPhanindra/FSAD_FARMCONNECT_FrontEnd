import React from "react";
import { motion } from "framer-motion";

/**
 * Terms.jsx
 * - Legal Terms of Service (ToS) for full stack marketplace
 * - Well formatted, accessible, animated on load
 * - Place in "/terms", add link to footer/navigation
 */

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-[#fcffe2] to-[#eaf7ff] pt-14 pb-24 px-3">
      <motion.section
        className="max-w-2xl mx-auto bg-white/98 rounded-3xl shadow-2xl p-10"
        initial={{ opacity: 0, y: 34 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl md:text-4xl font-black text-green-900 mb-5 text-center">Terms of Service</h2>
        <div className="mb-8 text-gray-600 text-sm text-center">Last updated: 5 November 2025</div>
        <h3 className="text-xl font-bold text-green-800 mt-4 mb-2">Introduction</h3>
        <p className="mb-4">
          FarmConnect provides a digital marketplace connecting farmers and buyers for agricultural goods. By accessing or using our platform, you agree to these Terms of Service.
        </p>
        <h3 className="text-lg font-bold text-green-800 mt-4">1. Account and Eligibility</h3>
        <ul className="list-disc ml-8 mb-3 text-gray-700">
          <li>You must provide accurate and complete registration details.</li>
          <li>You are responsible for maintaining account security.</li>
          <li>We reserve the right to suspend accounts for violations.</li>
        </ul>
        <h3 className="text-lg font-bold text-green-800 mt-4">2. Marketplace Use</h3>
        <ul className="list-disc ml-8 mb-3 text-gray-700">
          <li>Transactions are strictly between buyers and sellers. FarmConnect is not a direct party to product contracts but provides dispute resolution mechanisms.</li>
          <li>You agree not to misuse, spam, or defraud on the platform.</li>
        </ul>
        <h3 className="text-lg font-bold text-green-800 mt-4">3. Payments and Fees</h3>
        <ul className="list-disc ml-8 mb-3 text-gray-700">
          <li>All payments are processed securely.</li>
          <li>Platform may charge reasonable transaction or listing fees, notified in advance.</li>
          <li>All sales are final, except where refunds/returns are required by law or expressly allowed by product terms.</li>
        </ul>
        <h3 className="text-lg font-bold text-green-800 mt-4">4. Content and Conduct</h3>
        <ul className="list-disc ml-8 mb-3 text-gray-700">
          <li>No offensive, illegal, or misleading listings are permitted.</li>
          <li>All images, reviews, and text posted by users must respect our guidelines and copyright law.</li>
        </ul>
        <h3 className="text-lg font-bold text-green-800 mt-4">5. Liability & Indemnity</h3>
        <p className="mb-4">
          FarmConnect is not responsible for loss, injury, or damages due to transactions between users. You agree to indemnify FarmConnect for all claims arising from your use.
        </p>
        <h3 className="text-lg font-bold text-green-800 mt-4">6. Modifications</h3>
        <p className="mb-4">
          We may update these Terms. Continued use after changes indicates acceptance.
        </p>
        <h3 className="text-lg font-bold text-green-800 mt-4">7. Governing Law</h3>
        <p>This service is governed by Indian law and subject to exclusive jurisdiction of courts in Mumbai, India.</p>
        <div className="mt-9 text-gray-500 text-center text-xs">If you have questions, please contact us at support@farmconnect.com</div>
      </motion.section>
    </div>
  );
}
