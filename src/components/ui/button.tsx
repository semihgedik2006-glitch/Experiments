"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { ReactNode } from "react";

const MotionLink = motion.create(Link);

type Variant = "primary" | "secondary" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary: "bg-lime text-[#0d0d0f]",
  secondary: "border border-border text-foreground hover:border-lime hover:text-lime",
  ghost: "text-foreground hover:text-lime",
};

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
  type,
  ...props
}: {
  href?: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  type?: "button" | "submit";
  [key: string]: unknown;
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-semibold transition-colors duration-200 ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <MotionLink
        href={href}
        className={classes}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {children}
      </MotionLink>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      type={type ?? "button"}
      className={classes}
      {...props}
    >
      {children}
    </motion.button>
  );
}
