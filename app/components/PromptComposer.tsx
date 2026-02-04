"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface PromptComposerProps {
  onSubmit: (value: string) => Promise<void> | void;
  disabled?: boolean;
}

export function PromptComposer({ onSubmit, disabled }: PromptComposerProps) {
  const [value, setValue] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!value.trim()) return;
    const snapshot = value;
    setValue("");
    await onSubmit(snapshot.trim());
  };

  return (
    <motion.form
      layout
      onSubmit={handleSubmit}
      className="relative flex w-full items-center gap-3 rounded-3xl border border-white/10 bg-surface/80 px-6 py-4 backdrop-blur"
    >
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Ask anything. I will reason, search, and synthesize like ChatGPT."
        className="h-16 w-full resize-none border-none bg-transparent text-base text-white outline-none placeholder:text-white/40"
        disabled={disabled}
      />

      <motion.button
        type="submit"
        disabled={disabled || value.trim().length === 0}
        whileTap={{ scale: 0.95 }}
        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white shadow-glow transition disabled:cursor-not-allowed disabled:bg-white/20"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.25117 2.17019L17.8357 9.01609C18.5901 9.35156 18.5728 10.4249 17.8074 10.7337L12.2859 13.0195C12.0635 13.1095 11.8902 13.2959 11.816 13.5231L9.82106 19.6441C9.54761 20.4774 8.3744 20.3887 8.21306 19.5212L6.79929 11.7576C6.76891 11.5929 6.8024 11.4238 6.89357 11.2866L11.2127 4.77458C11.6488 4.11681 10.8286 3.32984 10.1787 3.77616L3.00485 8.65066C2.79562 8.79511 2.53138 8.8389 2.2899 8.76819L0.470059 8.24422C-0.443281 7.9786 -0.154985 6.62943 0.786846 6.62943H2.54341C2.77239 6.62943 2.99225 6.53296 3.15324 6.36026L6.49061 2.7862C6.9673 2.27533 6.38874 1.48946 5.75401 1.74436L2.6287 2.98146C2.48521 3.03792 2.3186 3.02749 2.18317 2.95432C1.87984 2.79282 1.8833 2.32948 2.25117 2.17019Z"
            fill="currentColor"
          />
        </svg>
      </motion.button>
    </motion.form>
  );
}
