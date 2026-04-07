import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedButton from "./AnimatedButton.jsx";

/**
 * FeatureCarousel.jsx
 * - Animated, swipeable/tappable carousel for highlights/features/testimonials
 * - Dots and prev/next controls, auto-advance, pause-on-hover
 * - Use for home/landing or product feature spotlights
 */

export default function FeatureCarousel({
  slides = [],
  autoAdvance = 7500,
  showDots = true,
  showControls = true,
  loop = true,
  width = "max-w-2xl",
  className = ""
}) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timeoutRef = useRef();
  const count = slides.length;

  React.useEffect(() => {
    if (autoAdvance > 0 && !paused && count > 1) {
      timeoutRef.current = setTimeout(() => setIdx(i => loop ? (i+1)%count : Math.min(i+1, count-1)), autoAdvance);
      return () => clearTimeout(timeoutRef.current);
    }
  }, [idx, paused, autoAdvance, count, loop]);

  function go(i) {
    setIdx(i<0?count-1:i>=count?0:i);
  }

  return (
    <motion.section
      className={`bg-white/97 rounded-2xl shadow-2xl p-6 flex flex-col items-center relative ${width} ${className}`}
      onMouseEnter={()=>setPaused(true)}
      onMouseLeave={()=>setPaused(false)}
    >
      <div className="w-full h-40 md:h-48 flex items-center justify-center relative overflow-hidden">
        <AnimatePresence initial={false} custom={idx}>
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 45 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -45 }}
            transition={{ duration: 0.37 }}
            className="w-full h-full flex flex-col items-center justify-center absolute left-0 top-0"
          >
            {/* Flexible content */}
            {slides[idx]?.img && (
              <img src={slides[idx].img} alt="" className="h-24 mb-2 rounded-xl shadow-lg border border-green-100"/>
            )}
            {slides[idx]?.emoji && (
              <span className="text-5xl mb-2">{slides[idx].emoji}</span>
            )}
            {slides[idx]?.title && (
              <span className="font-bold text-lg text-green-900 mb-2">{slides[idx].title}</span>
            )}
            <span className="text-gray-700 text-center px-5">{slides[idx]?.text}</span>
            {slides[idx]?.cta && (
              <AnimatedButton className="mt-5" {...slides[idx].cta} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      {/* Controls */}
      <div className="flex gap-8 justify-center items-center w-full mt-7">
        {showControls && (
          <button
            className="rounded-full bg-green-100 px-3 py-1.5 text-2xl font-bold hover:bg-green-200"
            onClick={()=>go(idx-1)} aria-label="Prev">&lt;</button>
        )}
        {showDots && (
          <div className="flex gap-1">
            {[...Array(count)].map((_, i) => (
              <button
                key={i}
                className={`w-3.5 h-3.5 rounded-full ${i===idx ? "bg-green-700" : "bg-green-200"} border border-green-400`}
                onClick={()=>go(i)}
                aria-label={`Go to slide ${i+1}`}
              ></button>
            ))}
          </div>
        )}
        {showControls && (
          <button
            className="rounded-full bg-green-100 px-3 py-1.5 text-2xl font-bold hover:bg-green-200"
            onClick={()=>go(idx+1)} aria-label="Next">&gt;</button>
        )}
      </div>
    </motion.section>
  );
}
