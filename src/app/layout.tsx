import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { MotionProvider } from "@/components/motion-provider";
import { GoogleAnalytics } from "@/components/google-analytics";
import { CookieConsent } from "@/components/cookie-consent";
import { siteConfig } from "@/lib/site-config";

// Die Schriften liegen im Projekt (src/app/fonts, SIL Open Font License)
// statt über next/font/google geladen zu werden: Das holt sie bei jedem
// Build von Google, und zweimal ist der Build daran gescheitert, dass
// Google kurz nicht erreichbar war. Es sind die variablen Fassungen mit
// dem Zeichensatz "latin" (inkl. Umlaute) - alle Stärken in einer Datei.

// Fließtext: Figtree - ruhig, gut lesbar, mit leicht warmem Charakter, der
// zur sandfarbenen Grundfläche passt.
const figtree = localFont({
  src: "./fonts/figtree-latin.woff2",
  variable: "--font-body",
  weight: "300 900",
  display: "swap",
  // Angeglichene Ersatzschrift bis zum Laden: globals.css, "Ersatzschriften".
  adjustFontFallback: false,
  fallback: ["Figtree Ersatz", "Arial", "sans-serif"],
});

// Überschriften: Archivo in den schweren Schnitten. Kräftig und breit
// genug, um sportlich zu wirken, ohne ins Technisch-Verspielte zu kippen -
// die Vorgängerschrift Orbitron las sich eher nach Science-Fiction.
const archivo = localFont({
  src: "./fonts/archivo-latin.woff2",
  variable: "--font-heading",
  weight: "100 900",
  display: "swap",
  // Angeglichene Ersatzschrift bis zum Laden: globals.css, "Ersatzschriften".
  adjustFontFallback: false,
  fallback: ["Archivo Ersatz", "Arial", "sans-serif"],
});

/**
 * Einmal am Tag frisch - und sofort, wenn sich etwas ändert.
 *
 * Die öffentlichen Seiten werden einmal erzeugt und dann als fertige
 * Fassung ausgeliefert. Eine Anfrage, Absage, Verschiebung oder Änderung
 * im Adminbereich frischt sie sofort auf (revalidatePath in lib/actions).
 * Was nur mit dem Datum veraltet - ein Termin, der gestern war -,
 * erneuert der morgendliche Lauf (api/cron/generate-slots): Er erklärt
 * alle Seiten für veraltet und ruft sie gleich danach einmal auf.
 *
 * Hier standen bis zum 25.11.2026 fünf Minuten. Jede Seite hat sich
 * dadurch bis zu 288-mal am Tag neu erzeugt, und jedes Mal wurde die
 * Datenbank geweckt. Sie schläft erst nach fünf Minuten Ruhe wieder ein -
 * lief also rund um die Uhr, bis das Monatskontingent aufgebraucht war
 * und die Formulare ausfielen. Die Frist hier ist nur noch das Netz für
 * den Fall, dass der morgendliche Lauf ausfällt.
 */
export const revalidate = 86400;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  // Grundwert für alle Seiten ohne eigene Angabe - im Wesentlichen die
  // Startseite.
  alternates: {
    canonical: "/",
    // Verweis auf die englische Fassung. Jede Seite mit eigener Angabe
    // (seitenMetadaten) setzt ihr eigenes Paar.
    languages: { de: "/", en: "/en", "x-default": "/" },
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} - ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} - ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  // Bestätigung für die Google Search Console ("HTML-Tag"): Den Code aus
  // der Search Console in Vercel als GOOGLE_SITE_VERIFICATION eintragen,
  // neu bereitstellen, dann dort auf "Bestätigen". Ohne Code kein Tag.
  //
  // Dasselbe für die Bing Webmaster Tools (Methode "Meta-Tag") als
  // BING_SITE_VERIFICATION. Bing lohnt sich doppelt: Seine Suche speist
  // auch die Websuche in ChatGPT und Copilot - wer bei Bing fehlt, fehlt
  // dort ebenfalls.
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.BING_SITE_VERIFICATION
      ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } }
      : {}),
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0f120e" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${figtree.variable} ${archivo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <MotionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
          <CookieConsent>
            <GoogleAnalytics />
          </CookieConsent>
        </MotionProvider>
      </body>
    </html>
  );
}
