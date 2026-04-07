import React from "react";
import { motion as Motion } from "framer-motion";

/**
 * Decorative 4-point star used across the site (banner sparkles, section accents).
 */
export function DecorativeStar({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12 0C12 6.62742 17.3726 12 24 12C17.3726 12 12 17.3726 12 24C12 17.3726 6.62742 12 0 12C6.62742 12 12 6.62742 12 0Z" fill="currentColor" />
    </svg>
  );
}

/**
 * Watercolor bubble background — consistent across Home, QuickQuiz, and FullAssessment.
 * Uses `fixed` positioning on quiz pages, `absolute` on Home (controlled via prop).
 */
export function WatercolorBackground({ fixed = false }) {
  return (
    <div className={`pointer-events-none ${fixed ? "fixed" : "absolute"} inset-0 overflow-hidden z-0`}>
      <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-multiply z-10" />
      
      {/* Aqua / Cyan Bubble */}
      <Motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15], x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-5%] h-[600px] w-[600px] rounded-full bg-cyan-400/30 blur-[120px]"
      />
      
      {/* Magenta / Fuchsia Bubble */}
      <Motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1], x: [0, -40, 0], y: [0, 50, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[20%] right-[-10%] h-[700px] w-[700px] rounded-full bg-fuchsia-400/20 blur-[130px]"
      />
      
      {/* Deep Violet Bubble */}
      <Motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1], x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute bottom-[-10%] left-[20%] h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[140px]"
      />

      {/* Overlay gradient to keep text readable */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(253,253,254,0.4),rgba(253,253,254,0.8)_60%,#FDFDFE_100%)] z-0" />
    </div>
  );
}

/**
 * Fade-up animation variants shared across all pages.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 1, ease: [0.21, 0.47, 0.32, 0.98] },
  }),
};
