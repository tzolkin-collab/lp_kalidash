"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  value: string;
  duration?: number;
  delay?: number;
  className?: string;
}

function parseNumericValue(v: string): { prefix: string; num: number; suffix: string } {
  const match = v.match(/^([^\d]*)(\d+\.?\d*)(.*)$/);
  if (!match) return { prefix: "", num: 0, suffix: v };
  return { prefix: match[1], num: parseFloat(match[2]), suffix: match[3] };
}

export function CountUp({ value, duration = 1200, delay = 0, className = "" }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [current, setCurrent] = useState(0);
  const [started, setStarted] = useState(false);

  const { prefix, num, suffix } = parseNumericValue(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setStarted(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out quart
      const eased = 1 - Math.pow(1 - progress, 4);
      setCurrent(Math.round(eased * num));
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [started, num, duration]);

  const display = started ? current : 0;

  return (
    <span ref={ref} className={className}>
      {prefix}{display}{suffix}
    </span>
  );
}
