import React from "react";
import { motion } from "framer-motion";

/**
 * OnboardingSteps.jsx
 * - Visual animated stepper for onboarding, profile, seller journey, etc.
 * - Steps, labels, completion, current status
 * - Props: steps, current, onStep, colors
 */

export default function OnboardingSteps({
  steps = [
    { icon: "📝", label: "Create Account" },
    { icon: "👤", label: "Complete Profile" },
    { icon: "🛒", label: "First Order" },
    { icon: "⭐", label: "Leave a Review" }
  ],
  current = 0,
  onStep,
  colorActive = "bg-green-600 text-white",
  colorDone = "bg-green-200 text-green-800",
  colorPending = "bg-green-50 text-gray-400"
}) {
  return (
    <div className="w-full flex flex-col items-center py-12 px-4">
      <div className="flex flex-row justify-center items-center gap-0 md:gap-8 w-full max-w-2xl">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <React.Fragment key={i}>
              <motion.button
                className={`rounded-full w-16 h-16 flex flex-col items-center justify-center shadow-lg font-bold text-2xl border-4 transition duration-200
                  ${done ? colorDone : active ? colorActive : colorPending}
                  ${onStep ? "cursor-pointer hover:scale-110" : "cursor-default"}
                `}
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.32 + 0.07 * i }}
                onClick={onStep ? () => onStep(i) : undefined}
                aria-current={active}
                aria-label={s.label}
              >
                <span className="mb-1">{s.icon}</span>
                <span className="text-xs font-semibold">{s.label}</span>
              </motion.button>
              {i < steps.length - 1 && (
                <div className="flex-1 h-2 mt-7 md:mx-2 bg-green-200 rounded-full">
                  <div
                    className={`h-full rounded-full transition duration-300
                      ${done ? "bg-green-600" : active ? "bg-green-400" : "bg-green-100"}
                    `}
                    style={{ width: "100%", height: "100%" }}
                  ></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
