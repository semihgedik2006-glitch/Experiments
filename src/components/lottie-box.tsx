"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// lottie-web touches `document` on import, so it must never run on the server.
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

/**
 * Lazily fetches a Lottie JSON from /public and renders it looping.
 * The JSON stays out of the JS bundle and only loads when the
 * component mounts.
 */
export function LottieBox({ src, className }: { src: string; className?: string }) {
  const [data, setData] = useState<object | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(src)
      .then((response) => response.json())
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!data) return <div className={className} aria-hidden />;

  return (
    <div className={className} aria-hidden>
      <Lottie animationData={data} loop autoplay />
    </div>
  );
}
