"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

type Sparkle = { id: string; x: number; y: number; color: string; delay: number; scale: number };

// Adapted from Magic UI Sparkles Text for inline use inside a button.
export function SparklesText({ children, className, sparklesCount = 10, colors = { first: "#9E7AFF", second: "#FE8BBB" } }: {
  children: string;
  className?: string;
  sparklesCount?: number;
  colors?: { first: string; second: string };
}) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    function refresh() {
      setSparkles(Array.from({ length: sparklesCount }, () => ({
        id: crypto.randomUUID(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: Math.random() > 0.5 ? colors.first : colors.second,
        delay: Math.random() * 2,
        scale: Math.random() + 0.3,
      })));
    }
    refresh();
    const timer = window.setInterval(refresh, 5000);
    return () => window.clearInterval(timer);
  }, [colors.first, colors.second, reducedMotion, sparklesCount]);

  return (
    <span className={cn("relative inline-block", className)}>
      <span className="relative z-10">{children}</span>
      {sparkles.map((sparkle) => (
        <motion.svg
          key={sparkle.id}
          className="pointer-events-none absolute size-3"
          style={{ left: `${sparkle.x}%`, top: `${sparkle.y}%` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, sparkle.scale, 0], rotate: [75, 120, 150] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: sparkle.delay }}
          viewBox="0 0 21 21"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M10.5 0C11.5 7 14 9.5 21 10.5C14 11.5 11.5 14 10.5 21C9.5 14 7 11.5 0 10.5C7 9.5 9.5 7 10.5 0Z" fill={sparkle.color} />
        </motion.svg>
      ))}
    </span>
  );
}
