/**
 * Basisadresse der Website.
 *
 * Sie steckt in den kanonischen Adressen, in der Sitemap, in den
 * strukturierten Daten und im Vorschaubild - überall dort sagt sie Google
 * und anderen Diensten: "Das hier ist das Original."
 *
 * Genau deshalb darf sie nicht auf eine Adresse zeigen, die woanders hin
 * weiterleitet. Solange ems-training.koeln noch auf die Körperformen-
 * Zentrale umleitet, würde jede Seite Google dorthin schicken - unsere
 * Inhalte würden also der Zentrale zugerechnet.
 *
 * Deshalb ist die Adresse umschaltbar:
 *   1. NEXT_PUBLIC_SITE_URL, falls gesetzt - das ist der Schalter. In Vercel
 *      unter Settings -> Environment Variables eintragen: solange die eigene
 *      Domain noch nicht auf das Projekt zeigt, die *.vercel.app-Adresse;
 *      zur Veröffentlichung dann die richtige Domain.
 *   2. Sonst die Produktionsadresse, die Vercel selbst kennt.
 *   3. Sonst die vorgesehene Domain - der Zustand nach der Umstellung.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const fromVercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (fromVercel) return `https://${fromVercel.replace(/\/+$/, "")}`;

  return "https://www.ems-training.koeln";
}

export const siteConfig = {
  name: "Körperformen",
  tagline: "Der Vorreiter für gesundheitsorientiertes EMS Training",
  description:
    "Körperformen ist dein EMS-Studio für effektives Training in nur 20 Minuten pro Woche. Abnehmen, Muskeln aufbauen und Rückenschmerzen lindern - ohne Zeitaufwand im klassischen Fitnessstudio.",
  url: resolveSiteUrl(),
  keywords: [
    "EMS",
    "EMS Training",
    "Fitness",
    "Abnehmen",
    "Studio",
    "Hürth",
    "Köln",
    "Brühl",
    "Sport",
    "Personal Training",
  ],
  contact: {
    phone: "+49 2233 9667181",
    email: "info@koerperformen.com",
  },
  social: {
    instagram: "https://instagram.com/koerperformen_huerth",
    facebook: "https://facebook.com/koerperformen.huerth",
    tiktok: "https://tiktok.com/@koerperformen",
  },
};

export const mainNav = [
  { label: "Home", href: "/" },
  { label: "EMS-Training", href: "/ems-training" },
  { label: "Studio", href: "/studio" },
  { label: "Preise", href: "/preise" },
  { label: "Erfolge", href: "/erfolgsgeschichten" },
  { label: "Über uns", href: "/ueber-uns" },
  { label: "Blog", href: "/blog" },
  { label: "Kontakt", href: "/kontakt" },
];
