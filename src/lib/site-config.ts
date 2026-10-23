import { basisadresseErmitteln } from "@/lib/basisadresse";

/**
 * Basisadresse der Website.
 *
 * Sie steckt in den kanonischen Adressen, in der Sitemap, in den
 * strukturierten Daten und im Vorschaubild - überall dort sagt sie Google
 * und anderen Diensten: "Das hier ist das Original."
 *
 * Genau deshalb darf sie nicht auf eine Adresse zeigen, die woanders hin
 * weiterleitet. So war es bei ems-training.koeln, der zuerst vorgesehenen
 * Domain: Sie leitete auf die Körperformen-Zentrale um, jede Seite hätte
 * Google dorthin geschickt - unsere Inhalte wären der Zentrale
 * zugerechnet worden. Die Seite läuft deshalb unter koerperformen-koeln.de.
 *
 * Ermittlung, Prüfung und Begründung stehen in @/lib/basisadresse - dort
 * steht auch, warum ein falsch eingetragener Wert die Seite nicht mehr
 * umwirft und warum VERCEL_URL nicht mehr verwendet wird.
 * Im Adminbereich unter „Adresse & Auffindbarkeit“ ist jederzeit zu
 * sehen, welche Adresse gerade gilt und woher sie kommt.
 */

export const siteConfig = {
  name: "Körperformen",
  // Steht im Seitentitel ("Körperformen - EMS-Training in Köln und
  // Umgebung"). Vorher "Der Vorreiter für gesundheitsorientiertes EMS
  // Training" - eine Behauptung, die sich nicht belegen lässt.
  tagline: "EMS-Training in Köln und Umgebung",
  /** Unter dem Logo im Fußbereich und auf "Über uns". */
  claim: "Der größte Körperformen-Partner in Köln und Umgebung",
  description:
    // Das steht in Google unter dem Suchergebnis. Vorher: "Abnehmen,
    // Muskeln aufbauen und Rückenschmerzen lindern" - ein Gesundheits-
    // versprechen, das niemand belegen kann und das abmahnfähig ist.
    // Jetzt: was es gibt, wo, und der nächste Schritt.
    "EMS-Training mit persönlichem Trainer: 20 Minuten pro Woche, in Studios in Köln und Umgebung. Jetzt kostenloses Probetraining buchen.",
  url: basisadresseErmitteln().url,
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
    email: "huerth@kformen.com",
  },
  /**
   * Das Körperformen-Netz, zu dem die eigenen Studios gehören. Die Zahl der
   * eigenen Studios kommt aus der Datenbank; die Gesamtzahl kennt nur die
   * Zentrale - deshalb steht sie hier und muss bei Änderungen von Hand
   * nachgezogen werden.
   */
  netzwerk: {
    studiosGesamt: 277,
  },
  social: {
    instagram: "https://instagram.com/koerperformen_huerth",
    facebook: "https://facebook.com/koerperformen.huerth",
    tiktok: "https://tiktok.com/@koerperformen",
  },
};

// Geordnet nach dem Weg durch die Seite (lib/weg.ts): verstehen, erleben,
// entscheiden, dabeibleiben. "Home" steht nicht mehr darin - dafür ist das
// Logo da, und der Platz geht an "Erster Besuch". Im Handymenü steht die
// Startseite trotzdem, siehe header.tsx.
export const mainNav = [
  { label: "EMS-Training", href: "/ems-training" },
  { label: "Erster Besuch", href: "/erster-besuch" },
  { label: "Studio", href: "/studio" },
  { label: "Preise", href: "/preise" },
  { label: "Erfolge", href: "/erfolgsgeschichten" },
  { label: "Wissen", href: "/blog" },
  // In der Kopfzeile am Computer nicht mehr: Sieben Punkte plus Englisch,
  // Suche und Hell/Dunkel waren zu viel. Beide stehen im Handy-Menü und in
  // der Fußzeile - dort sucht man sie.
  { label: "Über uns", href: "/ueber-uns", nurUnten: true },
  { label: "Kontakt", href: "/kontakt", nurUnten: true },
];
