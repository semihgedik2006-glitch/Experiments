"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const easeOut = [0.16, 1, 0.3, 1] as const;

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOut } },
};

// Der Versatz zwischen den Einträgen wurde halbiert: Bei vierzehn Studios
// summierten sich 0,06 s je Eintrag auf über eine Sekunde, bis der letzte
// stand - in einem Arbeitswerkzeug wartet man darauf. Jetzt ist die Liste
// nach gut einer halben Sekunde vollständig.
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.035 } },
};

// Mount-based stagger for above-the-fold admin content (unlike the public
// site's scroll-triggered Reveal/Stagger, this always animates in on load).
export function AdminStagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className={className}>
      {children}
    </motion.div>
  );
}

export function AdminStaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
