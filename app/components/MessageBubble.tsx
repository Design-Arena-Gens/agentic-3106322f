"use client";

import { motion } from "framer-motion";
import React from "react";
import ReactMarkdown from "react-markdown";

export type MessageRole = "assistant" | "user" | "system" | "thinking";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  sources?: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  thoughts?: string[];
}

interface MessageBubbleProps {
  message: Message;
}

const roleConfig: Record<MessageRole, { label: string; tone: string }> = {
  user: { label: "You", tone: "bg-surface/70 border border-white/10" },
  assistant: { label: "DeepThink", tone: "bg-surface/90 border border-accent/30 shadow-glow" },
  system: { label: "System", tone: "bg-yellow-400/10 border border-yellow-300/40" },
  thinking: { label: "DeepThink", tone: "bg-surface/80 border border-accent/10" }
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const { label, tone } = roleConfig[message.role];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`rounded-3xl px-6 py-5 backdrop-blur-sm ${tone}`}
    >
      <header className="mb-3 flex items-center gap-3">
        <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-white/5">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-sm font-semibold uppercase tracking-wide text-accent"
          >
            {label}
          </motion.span>
        </div>
        <div className="text-xs uppercase tracking-[0.3rem] text-white/40">
          {message.role === "assistant"
            ? "neural synthesis"
            : message.role === "user"
            ? "human prompt"
            : message.role === "thinking"
            ? "cognitive trace"
            : "system"}
        </div>
      </header>

      <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-strong:text-white prose-code:text-[0.95rem] prose-code:bg-white/10 prose-code:px-2 prose-code:py-1 prose-code:rounded-xl">
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>

      {message.thoughts && message.thoughts.length > 0 && (
        <section className="mt-4 rounded-2xl bg-black/20 p-4 text-sm text-white/70">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.25rem] text-white/40">
            Deliberation Trace
          </h4>
          <ul className="space-y-2">
            {message.thoughts.map((thought, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent"></span>
                <span>{thought}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {message.sources && message.sources.length > 0 && (
        <section className="mt-4 grid gap-3 md:grid-cols-2">
          {message.sources.map((source, idx) => (
            <a
              key={idx}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="group block rounded-2xl border border-white/5 bg-white/5 p-4 transition hover:border-accent/50 hover:bg-accentSoft/40"
            >
              <div className="mb-1 text-xs uppercase tracking-[0.25rem] text-accent/70">source</div>
              <div className="text-sm font-semibold text-white/90 group-hover:text-white">
                {source.title || source.url}
              </div>
              <p className="mt-2 max-h-20 overflow-hidden text-sm text-white/60">
                {source.snippet}
              </p>
            </a>
          ))}
        </section>
      )}
    </motion.article>
  );
}
