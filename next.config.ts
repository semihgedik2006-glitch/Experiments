import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Content-Security-Policy ohne Nonces: Nonces erzwängen dynamisches Rendern
 * jeder Seite (kein statisches Ausliefern, kein ISR). Deshalb bleibt
 * 'unsafe-inline' für Skripte, aber fremde Skript-Quellen, Rahmen, Formular-
 * ziele, <base> und Plugins sind gesperrt. Erlaubt sind nur Google Analytics
 * (nach Zustimmung) und die Google-Maps-Karte. Bilder dürfen von jeder
 * https-Adresse kommen, weil Titel- und Trainerbilder als freie Adresse im
 * Adminbereich gepflegt werden. Wer einen neuen Dienst einbindet, trägt ihn
 * hier und in tests/csp.test.ts ein.
 */
export const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "media-src 'self' blob:",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://*.g.doubleclick.net https://www.google.com",
  "frame-src https://www.google.com https://maps.google.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

/** Sicherheits-Header für alle Seiten. */
const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },

  // Verhindert, dass die Seite in einen fremden Rahmen eingebettet wird
  // (Clickjacking, z.B. um Klicks auf den Buchungs-Button zu erschleichen).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },

  // Browser sollen den vom Server angegebenen Dateityp nicht überstimmen.
  { key: "X-Content-Type-Options", value: "nosniff" },

  // Beim Wechsel auf fremde Seiten nur die Domain übermitteln, nicht die
  // vollständige URL - sonst sieht z.B. Google, welche Unterseite jemand las.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  // Funktionen, die diese Website nicht braucht, generell abschalten.
  // Geolocation bleibt erlaubt: Sie wird für den Studio-Vorschlag genutzt.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), payment=(), usb=(), geolocation=(self)",
  },

  // Erzwingt HTTPS für zukünftige Aufrufe (inkl. Subdomains).
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  // Seitenübergänge (src/components/ui/ziel-uebergang.tsx) brauchen seit
  // Next 16.3 keinen Schalter mehr.
  experimental: {
    // Das Stylesheet steht direkt im HTML statt als eigene Datei. Am Handy
    // spart das beim ersten Besuch eine Runde zum Server, bevor überhaupt
    // etwas zu sehen ist: gemessen rund 0,9 s früher sichtbar (16.11.2026).
    inlineCss: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Der Verwaltungsbereich soll nicht in Suchmaschinen auftauchen.
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
