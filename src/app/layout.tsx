import type { Metadata, Viewport } from "next";
import { Titillium_Web, Orbitron } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { MotionProvider } from "@/components/motion-provider";
import { GoogleAnalytics } from "@/components/google-analytics";
import { CookieConsent } from "@/components/cookie-consent";
import { siteConfig } from "@/lib/site-config";

// Nur die Stärken laden, die im Code tatsächlich vorkommen. Die zuvor
// geladene 300 kommt nirgends vor. Titillium Web bietet keine 500 an -
// die wenigen font-medium-Stellen stellt der Browser deshalb mit 400 dar.
const titillium = Titillium_Web({
  variable: "--font-titillium",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  display: "swap",
});

// Die Display-Schrift wird ausschließlich in font-black (900) eingesetzt.
const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
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
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0d0f" },
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
      className={`${titillium.variable} ${orbitron.variable} h-full antialiased`}
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
