"use client";

import { motion } from "framer-motion";

const dots = [0, 1, 2];

export function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-accent/30 bg-accentSoft/50 px-6 py-4 shadow-glow">
      <motion.span
        className="text-xs uppercase tracking-[0.35rem] text-accent/80"
        initial={{ opacity: 0.4 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
      >
        deep think
      </motion.span>

      <div className="flex items-center gap-1">
        {dots.map((dot) => (
          <motion.div
            key={dot}
            className="h-2 w-2 rounded-full bg-white"
            initial={{ scale: 0.6, opacity: 0.3 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              repeatType: "reverse",
              delay: dot * 0.15
            }}
          />
        ))}
      </div>
    </div>
  );
}
