import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary: "bg-lime text-[#0d0d0f] hover:scale-105",
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
  const classes = `inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-semibold transition-all duration-200 ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type ?? "button"} className={classes} {...props}>
      {children}
    </button>
  );
}
