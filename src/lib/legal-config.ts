/**
 * Zentrale Stelle für alle rechtlich relevanten Firmenangaben.
 *
 * Die Angaben stammen aus dem vom Inhaber gelieferten Impressum und werden
 * von Impressum, Datenschutzerklärung und AGB gemeinsam genutzt.
 *
 * Bewusst getrennt von den Studio-Daten aus der Datenbank: Die
 * Geschäftsanschrift des Unternehmens (Köln-Rondorf) ist nicht identisch mit
 * der Adresse eines Trainingsstudios.
 */

export const legalConfig = {
  /** Firmenname wie im Geschäftsverkehr verwendet (u.a. in den AGB). */
  companyName: "KörperFormen",

  /**
   * Vollständiger Name des Inhabers. Das Unternehmen ist ein
   * Einzelunternehmen; nach § 5 DDG ist der volle bürgerliche Name
   * anzugeben, ein Registereintrag entfällt.
   */
  owner: "Marcel Almeida do Carmo",

  /** Ladungsfähige Geschäftsanschrift (Impressumspflicht). */
  address: {
    street: "Rondorfer Hauptstr. 27A",
    postalCode: "50997",
    city: "Köln",
    country: "Deutschland",
  },

  /** Unternehmenswebsite laut Impressum (Umlaut-Domain, Link braucht Punycode). */
  website: {
    label: "www.körperformen.com",
    href: "https://www.xn--krperformen-rfb.com",
  },

  /** Kontaktdaten für Impressum und Datenschutzanfragen. */
  contact: {
    phone: "0157 85090199",
    /** Für tel:-Links, ohne Leerzeichen. */
    phoneHref: "+4915785090199",
    email: "m.almeida@kformen.com",
  },

  /**
   * Umsatzsteuer-Identifikationsnummer nach § 27a UStG.
   *
   * Hinweis: Die vom Inhaber ebenfalls mitgeteilte Steuernummer wird hier
   * bewusst NICHT hinterlegt. Anzugeben ist nach § 5 Abs. 1 Nr. 6 DDG
   * ausschließlich die USt-IdNr.; die Steuernummer zu veröffentlichen ist
   * nicht erforderlich und wird aus Missbrauchsgründen nicht empfohlen.
   */
  vatId: "DE301004860",

  /** Stand der Rechtstexte (Impressum, Datenschutzerklärung, AGB). */
  lastUpdated: "September 2026",
} as const;
