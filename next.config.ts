import type { NextConfig } from "next";

/**
 * Sicherheits-Header für alle Seiten.
 *
 * Bewusst ohne Content-Security-Policy: Google Analytics und die
 * Google-Maps-Einbettung würden eine CSP erfordern, die beide Dienste
 * explizit erlaubt. Eine zu strenge CSP legt die Seite still lahm, eine zu
 * lockere bringt wenig - das gehört gesondert getestet.
 */
const securityHeaders = [
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
