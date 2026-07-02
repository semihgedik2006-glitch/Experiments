"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export function Logo({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const isLight = mounted && resolvedTheme === "light";

  return (
    <Image
      src={isLight ? "/logo-light.svg" : "/logo-dark.svg"}
      alt="Körperformen"
      width={145}
      height={40}
      priority
      className={className}
    />
  );
}
