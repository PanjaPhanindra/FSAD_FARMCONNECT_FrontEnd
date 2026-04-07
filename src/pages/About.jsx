import React from "react";
import { motion } from "framer-motion";

/**
 * About.jsx
 * - Mission, team, story, vision
 * - Animated, branded, visually diverse and easy to expand
 */

const TEAM = [
  {
    name: "Aditi Sharma",
    role: "Founder & CEO",
    img: "https://media.istockphoto.com/id/1092520698/photo/indian-farmer-at-onion-field.jpg?s=612x612&w=0&k=20&c=gvu-DzA17EyVSNzvdf7L3R8q0iIvLapG15ktOimqXqU=",
    desc: "Visionary leader with a passion for rural technology and sustainable agriculture."
  },
  {
    name: "Ravi Patel",
    role: "CTO",
    img: "https://www.shutterstock.com/image-photo/indian-farmer-harvesting-paddy-happy-600w-2510944615.jpg",
    desc: "Engineer and agri-tech enthusiast, architect of FarmConnect’s robust platform."
  },
  {
    name: "Sana Qureshi",
    role: "Head of Design",
    img: "https://media.istockphoto.com/id/498281885/photo/indian-farmer.jpg?s=612x612&w=0&k=20&c=ulJBzW-hy_738vv580iU5DCA-xOa7dh-bWyjERlQJrs=",
    desc: "Designs interfaces that empower users and embody trust and transparency."
  }
];

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-bl from-[#f1fbe7] to-[#ecf1ff] flex flex-col items-center pt-14 pb-24">
      <motion.section
        className="max-w-4xl mx-auto bg-white/98 rounded-3xl shadow-2xl p-10 mb-12"
        initial={{ opacity: 0, y: 29 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl md:text-4xl font-black text-green-900 mb-5 text-center">About FarmConnect</h2>
        <p className="text-xl text-gray-700 text-center mb-4">
          FarmConnect connects rural farmers directly to buyers all across India, opening new markets and unlocking agricultural prosperity using cutting-edge technology.
        </p>
        <div className="mt-7 text-green-800 bg-green-50 p-4 rounded-lg shadow mb-8 text-center text-lg">
          <b>Our Mission:</b> To empower every farmer and buyer with transparency, fairness, and trust—creating a sustainable supply chain for all.
        </div>
        <motion.img
          src="https://images.stockcake.com/public/c/7/f/c7f8dc24-32ff-4ad7-b2e2-470744265c9d_large/farmers-in-field-stockcake.jpg"
          alt="network"
          className="mx-auto w-[320px] mb-10 rounded-2xl shadow-lg"
          initial={{ opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
        />

        <div className="font-semibold text-xl text-green-900 mb-7 text-center">Meet the Team</div>
        <div className="flex flex-col md:flex-row gap-7 items-center justify-center">
          {TEAM.map(t => (
            <motion.div
              key={t.name}
              className="bg-white rounded-2xl shadow-lg flex flex-col items-center p-6 w-64 hover:scale-105 transition"
              whileHover={{ scale: 1.08, boxShadow: "0 10px 36px #a5f3fc38" }}
            >
              <img src={t.img} alt={t.name} className="h-24 w-24 rounded-full mb-2 border-4 border-green-100 shadow" />
              <span className="font-bold text-lg text-green-900">{t.name}</span>
              <span className="text-green-700 text-xs font-semibold mb-2">{t.role}</span>
              <span className="text-gray-600 text-sm text-center">{t.desc}</span>
            </motion.div>
          ))}
        </div>
      </motion.section>
      <section className="max-w-3xl mx-auto bg-green-50/90 rounded-xl shadow p-8">
        <h4 className="font-bold text-lg text-green-800 mb-2">Our Values</h4>
        <ul className="list-disc ml-7 text-gray-700 text-lg">
          <li>Transparency & Fairness</li>
          <li>Empowering Rural Communities</li>
          <li>Sustainability & Innovation</li>
        </ul>
      </section>
    </div>
  );
}
