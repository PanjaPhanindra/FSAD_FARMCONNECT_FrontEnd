import React from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import AnimatedButton from '../components/AnimatedButton.jsx';

// Animated gradient backgrounds for hero/sections
const heroBg = [
  "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  "linear-gradient(135deg, #fcb69f 0%, #ffe682 100%)",
  "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
];

// Animation variants
const appearVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: i => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.25,
      type: 'spring', stiffness: 80, damping: 19, duration: 0.9
    }
  }),
};

export default function Landing() {
  // Random color background for animation demo
  const [bg, setBg] = React.useState(heroBg[0]);
  React.useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setBg(heroBg[i % heroBg.length]);
      i++;
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div style={{ background: bg }} className="min-h-screen flex flex-col justify-between overflow-x-hidden">
      {/* HEADER */}
      <Header />

      {/* HERO SECTION */}
      <motion.section
        className="relative flex flex-col md:flex-row items-center justify-between px-6 pt-24 pb-12 md:py-36"
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="w-full md:w-1/2 space-y-6"
          variants={appearVariant}
          custom={0}
        >
          <h1 className="text-5xl md:text-6xl font-black text-shadow-green mb-4 drop-shadow-2xl text-green-900 animate-pulse">
            FarmConnect
          </h1>
          <p className="text-xl md:text-2xl text-green-900 font-medium opacity-95">
            Empowering rural farmers to transform their produce and connect with trusted buyers in a vibrant, modern, secure and sustainable digital marketplace.
          </p>
          <div className="flex gap-6 mt-10">
            <AnimatedButton to="/register" label="Get Started" color="primary" size="lg" />
            <AnimatedButton to="/login" label="Login" color="secondary" size="lg" />
          </div>
        </motion.div>

        <motion.div
          className="w-full md:w-1/2 flex items-center justify-center mt-12 md:mt-0"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0, transition: { delay: 0.8, duration: 1.1 } }}
        >
          {/* Hero Illustration */}
          <img
            src="/Users/panjaphanindra/Documents/FRONT END/COMET/Project/hand-drawn-farmers-market-logo_23-2149329268.jpg"
            alt="FarmConnect hero"
            className="max-w-xs md:max-w-md rounded-[2.5rem] shadow-2xl border-8 border-white pulse-border"
          />
        </motion.div>
      </motion.section>

      {/* FEATURES SECTION */}
      <motion.section
        className="my-14 max-w-6xl mx-auto px-4 md:px-8 py-14 rounded-3xl shadow-2xl bg-white/80 backdrop-blur-xl"
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          className="text-3xl md:text-4xl text-green-800 font-bold text-center mb-12"
          variants={appearVariant}
          custom={1}
        >
          Why Choose FarmConnect?
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {/* Farmer Tools */}
          <motion.div className="card"
            variants={appearVariant} custom={2}
            whileHover={{ scale: 1.04, boxShadow: "0 18px 55px #beaaff25" }}
          >
            <img src="data:image/jpeg;base64,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" alt="Farmer" className="w-16 h-16 mx-auto mb-4 pulse-border" />
            <h3 className="font-bold text-lg text-green-900">Sell Globally</h3>
            <ul className="mt-3 text-gray-700 text-sm font-medium space-y-2">
              <li>Transform harvest into premium goods</li>
              <li>Direct, simple farmer onboarding</li>
              <li>Stock, pricing, and order management</li>
            </ul>
          </motion.div>
          {/* Buyer Marketplace */}
          <motion.div className="card"
            variants={appearVariant} custom={3}
            whileHover={{ scale: 1.04, boxShadow: "0 18px 55px #ecbdff30" }}
          >
            <img src="https://media.gettyimages.com/id/2206670570/photo/happy-rural-indian-farmer-counting-money-while-standing-in-agriculture-wheat-field.jpg?s=612x612&w=gi&k=20&c=lGg_iumdkGJ8HgTUWn2DfZgIbgZYHX-TFRZVMkaHItw=" alt="Buyer" className="w-16 h-16 mx-auto mb-4 pulse-border" />
            <h3 className="font-bold text-lg text-blue-900">Buy with Confidence</h3>
            <ul className="mt-3 text-gray-700 text-sm font-medium space-y-2">
              <li>Discover real rural and organic products</li>
              <li>Secure ordering & delivery tracking</li>
              <li>Leave feedback, rate sellers</li>
            </ul>
          </motion.div>
          {/* Admin/Trust */}
          <motion.div className="card"
            variants={appearVariant} custom={4}
            whileHover={{ scale: 1.04, boxShadow: "0 18px 55px #ffd1732c" }}
          >
            <img src="https://www.shutterstock.com/image-vector/this-illustration-woman-inputting-paper-600nw-2408559447.jpg" alt="Admin" className="w-16 h-16 mx-auto mb-4 pulse-border" />
            <h3 className="font-bold text-lg text-yellow-900">Trust & Security</h3>
            <ul className="mt-3 text-gray-700 text-sm font-medium space-y-2">
              <li>Admin-powered dispute resolution</li>
              <li>Strong platform monitoring</li>
              <li>Continuous quality auditing</li>
            </ul>
          </motion.div>
        </div>
      </motion.section>

      {/* CALL TO ACTION */}
      <motion.section className="max-w-2xl mx-auto px-4 mb-16 py-7 rounded-xl theme-green shadow-lg flex flex-col items-center gap-7 fade-in-up">
        <h3 className="text-xl md:text-2xl font-semibold text-green-900 text-center">
          Ready to get started?<br />Join buyers & farmers across India connecting with a click!
        </h3>
        <AnimatedButton to="/role" label="Choose Your Role" color="primary" size="lg" />
      </motion.section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
