/**
 * Zentrale Stelle für alle rechtlich relevanten Firmenangaben.
 *
 * Bewusst getrennt von den Studio-Daten aus der Datenbank: Die
 * Geschäftsanschrift des Unternehmens (Impressum, Verantwortlicher nach DSGVO)
 * ist nicht zwingend identisch mit der Adresse eines Trainingsstudios.
 */

export type LegalForm = "einzelunternehmen" | "gbr" | "gmbh" | "ug" | "gmbh-co-kg";

export const legalConfig = {
  /** Firmenname wie im Geschäftsverkehr verwendet. */
  companyName: "KörperFormen",

  /**
   * Vollständiger Name des Inhabers. Bei Einzelunternehmen ist die Nennung
   * des vollen bürgerlichen Namens nach § 5 DDG Pflicht.
   */
  owner: "Marcel Almeida do Carmo",

  legalForm: "einzelunternehmen" as LegalForm,

  /** Ladungsfähige Geschäftsanschrift (Impressumspflicht). */
  address: {
    street: "Rondorfer Hauptstr. 27A",
    postalCode: "50997",
    city: "Köln",
    country: "Deutschland",
  },

  /** Kontaktdaten für Impressum und Datenschutzanfragen. */
  contact: {
    phone: "+49 1578 5090199",
    /** Für tel:-Links, ohne Leerzeichen. */
    phoneHref: "+4915785090199",
    email: "m.almeida@kformen.com",
  },

  /**
   * Umsatzsteuer-Identifikationsnummer nach § 27a UStG.
   *
   * Hinweis: Die Steuernummer (216/5002/3565) wird hier bewusst NICHT
   * hinterlegt. Anzugeben ist nach § 5 Abs. 1 Nr. 6 DDG ausschließlich die
   * USt-IdNr.; die Steuernummer zu veröffentlichen ist nicht erforderlich
   * und wird aus Missbrauchsgründen ausdrücklich nicht empfohlen.
   */
  vatId: "DE301004860",

  /** Nur bei Kapitalgesellschaften relevant - bei Einzelunternehmen keine. */
  registerCourt: null as string | null,
  registerNumber: null as string | null,

  /**
   * Zuständige Aufsichtsbehörde - nur nötig bei erlaubnispflichtigem Gewerbe.
   * Für ein Fitness-/EMS-Studio üblicherweise nicht einschlägig.
   */
  supervisoryAuthority: null as string | null,

  /**
   * Datenschutzbeauftragter. Pflicht i.d.R. erst ab 20 Personen, die ständig
   * mit automatisierter Datenverarbeitung beschäftigt sind.
   */
  dataProtectionOfficer: null as string | null,

  /** Für die Datenschutzerklärung: Stand der letzten Aktualisierung. */
  lastUpdated: "August 2026",
} as const;

/** Sichtbarer Platzhalter für fehlende Pflichtangaben. */
export const MISSING = "[BITTE ERGÄNZEN]";

export function legalValue(value: string | null | undefined): string {
  return value ?? MISSING;
}

/** Prüft, ob noch Pflichtangaben fehlen (steuert den Warnhinweis auf der Seite). */
export function hasMissingLegalData(): boolean {
  const c = legalConfig;

  if (!c.companyName || !c.owner || !c.legalForm) return true;
  if (!c.address.street || !c.address.postalCode || !c.address.city) return true;
  if (!c.contact.email) return true;

  // Kapitalgesellschaften müssen zusätzlich das Register angeben.
  const isCorporation =
    c.legalForm === "gmbh" || c.legalForm === "ug" || c.legalForm === "gmbh-co-kg";
  if (isCorporation && (!c.registerCourt || !c.registerNumber)) return true;

  // Eine USt-IdNr. ist nur anzugeben, sofern vorhanden - ihr Fehlen ist bei
  // Kleinunternehmern nach § 19 UStG kein Mangel.
  return false;
}
