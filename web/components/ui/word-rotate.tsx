"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type MotionProps } from "motion/react";

import { cn } from "@/lib/utils";

interface WordRotateProps {
  words: string[];
  duration?: number;
  loop?: boolean;
  motionProps?: MotionProps;
  className?: string;
}

export function WordRotate({
  words,
  duration = 2500,
  loop = true,
  motionProps = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
    transition: { duration: 0.25, ease: "easeOut" },
  },
  className,
}: WordRotateProps) {
  const [index, setIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (words.length < 2 || (!loop && index >= words.length - 1)) return;
    const timer = window.setTimeout(() => {
      setIndex((previous) => loop ? (previous + 1) % words.length : Math.min(previous + 1, words.length - 1));
    }, duration);

    return () => window.clearTimeout(timer);
  }, [index, words.length, duration, loop]);

  return (
    <div className="overflow-hidden py-2" role="status">
      <AnimatePresence mode="wait">
        <motion.p
          key={words[index]}
          className={cn(className)}
          {...motionProps}
          initial={reducedMotion ? false : motionProps.initial}
          animate={reducedMotion ? { opacity: 1 } : motionProps.animate}
          exit={reducedMotion ? { opacity: 0 } : motionProps.exit}
          transition={reducedMotion ? { duration: 0 } : motionProps.transition}
        >
          {words[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
