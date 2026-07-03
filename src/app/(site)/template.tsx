"use client";

import { motion } from "motion/react";

// Soft cross-page fade on route changes. Opacity only - a transform here
// would turn this wrapper into a containing block and break position:fixed
// children like the search overlay.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
