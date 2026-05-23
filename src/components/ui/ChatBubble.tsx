import * as React from "react";

import { cn } from "@/lib/cn";

interface ChatBubbleProps {
  role: "user" | "assistant";
  children: React.ReactNode;
  className?: string;
}

/**
 * iMessage-style chat bubble. User messages float right in iOS blue; the
 * AI assistant ("Ember") replies float left in a frosted bubble. Use
 * shared corners so consecutive bubbles from the same author group.
 */
export function ChatBubble({ role, children, className }: ChatBubbleProps) {
  const isUser = role === "user";
  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start",
        className,
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-3xl px-4 py-2.5 text-[15px] leading-relaxed",
          isUser
            ? "rounded-br-md bg-[#0a84ff] text-white shadow-[0_2px_8px_-2px_rgba(10,132,255,0.4)]"
            : "rounded-bl-md bg-white/60 text-zinc-900 border border-white/40 backdrop-blur-xl backdrop-saturate-150 dark:bg-white/[0.08] dark:text-zinc-50 dark:border-white/10",
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** Animated "AI is thinking" indicator. Three pulsing dots. */
export function ThinkingDots({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex items-end gap-1", className)}
      role="status"
      aria-label="Assistant is thinking"
    >
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="block size-2 rounded-full bg-zinc-500 dark:bg-zinc-300"
          style={{
            animation: "chat-bounce 1.2s ease-in-out infinite",
            animationDelay: `${delay}ms`,
          }}
        />
      ))}
      <style>{`
        @keyframes chat-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.45; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </span>
  );
}
