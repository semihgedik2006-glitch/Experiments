"use client";

import { useEffect, useSyncExternalStore } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

const emptySubscribe = () => () => {};

function readPointerCapability() {
  return (
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Soft brand-colored glow that trails the pointer. Purely decorative:
 * pointer-events pass through, it only renders on devices with a fine
 * pointer (no touch), and it uses spring-smoothed transforms so it
 * never causes layout work.
 */
export function CursorGlow() {
  const enabled = useSyncExternalStore(emptySubscribe, readPointerCapability, () => false);
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const springX = useSpring(x, { stiffness: 120, damping: 20, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 120, damping: 20, mass: 0.5 });

  useEffect(() => {
    if (!enabled) return;
    function onMove(event: PointerEvent) {
      x.set(event.clientX - 200);
      y.set(event.clientY - 200);
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[5] h-[400px] w-[400px] rounded-full blur-[80px]"
      style={{
        x: springX,
        y: springY,
        background: "radial-gradient(circle, var(--color-lime), transparent 65%)",
        opacity: 0.07,
      }}
    />
  );
}
