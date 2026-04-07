import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * FAQ.jsx
 * - Collapsible Q&A for Buyers, Sellers, and all users
 * - Animated, branded, and easy to expand for support
 */

const FAQS = [
  {
    q: "How do I place an order?",
    a: "Browse products in the Marketplace, add to cart, and proceed through checkout. Orders are delivered directly to your chosen address."
  },
  {
    q: "How do I become a seller?",
    a: "Register as a Seller and create your product listings. All sellers are verified before listings go live."
  },
  {
    q: "How do I track my order?",
    a: "Go to 'My Orders' in your dashboard. Each order displays real-time status and step-by-step delivery progress."
  },
  {
    q: "What payment methods are supported?",
    a: "You can securely pay via credit/debit card, UPI, or net banking. All payments are handled by our trusted payment partners."
  },
  {
    q: "What if my order arrives damaged?",
    a: "Raise a dispute via the 'Dispute Centre' or contact our support with your order number for immediate assistance."
  },
  {
    q: "Is FarmConnect available in my area?",
    a: "We deliver to all major regions and are expanding coverage. Enter your PIN code at checkout for instant availability check."
  },
  {
    q: "How do I delete my account?",
    a: "You may delete your account permanently from profile settings, or email privacy@farmconnect.com in compliance with our Privacy Policy."
  }
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-[#e8ecff] to-[#eafffa] pt-14 pb-28 px-5">
      <motion.section
        className="max-w-3xl mx-auto bg-white/96 rounded-3xl shadow-2xl p-10"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold text-green-900 text-center mb-8">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-5">
          {FAQS.map((f, i) => (
            <div key={i} className="rounded-xl border bg-green-50/50 border-green-100 shadow-md">
              <button
                className="flex justify-between items-center w-full py-4 px-7 font-bold text-lg text-green-900 focus:outline-none"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                aria-controls={`faq-panel-${i}`}
              >
                <span>{f.q}</span>
                <motion.span
                  animate={{ rotate: open === i ? 90 : 0 }}
                  className="text-2xl ml-3 text-orange-400"
                  transition={{ type: "spring", stiffness: 190 }}
                >
                  ▶
                </motion.span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    id={`faq-panel-${i}`}
                    key={i}
                    className="px-8 pb-6 text-green-800 text-lg"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    {f.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
