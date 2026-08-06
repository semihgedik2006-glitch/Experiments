/**
 * Zentrale Stelle für alle rechtlich relevanten Firmenangaben.
 *
 * WICHTIG: Alle Felder, die hier `null` sind, fehlen noch und werden auf der
 * Seite sichtbar als "[BITTE ERGÄNZEN]" angezeigt. Bitte vor dem endgültigen
 * Livegang vollständig ausfüllen - die Angaben im Impressum sind gesetzlich
 * vorgeschrieben (§ 5 DDG) und unvollständige Angaben sind abmahnfähig.
 */

export const legalConfig = {
  /** Vollständiger Firmenname inkl. Rechtsformzusatz, z.B. "Körperformen Köln GmbH" */
  companyName: "Körperformen Köln",

  /**
   * Vor- und Nachname des Inhabers bzw. der Geschäftsführung.
   * TODO: Bitte prüfen, ob diese Angabe noch stimmt.
   */
  owner: "Marcel Almeida",

  /**
   * Rechtsform: "einzelunternehmen" | "gbr" | "gmbh" | "ug" | "gmbh-co-kg"
   * TODO: Beim Chef erfragen. Steht auf dem Gewerbeschein bzw. im Handelsregister.
   */
  legalForm: null as null | "einzelunternehmen" | "gbr" | "gmbh" | "ug" | "gmbh-co-kg",

  /**
   * Umsatzsteuer-Identifikationsnummer nach § 27a UStG, Format "DE123456789".
   * TODO: Steht auf euren Rechnungen. Falls ihr Kleinunternehmer nach § 19 UStG
   * seid und keine USt-ID habt, hier `null` lassen - dann entfällt der Abschnitt.
   */
  vatId: null as string | null,

  /**
   * Nur bei GmbH / UG / GmbH & Co. KG nötig.
   * TODO: z.B. registerCourt: "Amtsgericht Köln", registerNumber: "HRB 12345"
   */
  registerCourt: null as string | null,
  registerNumber: null as string | null,

  /**
   * Zuständige Aufsichtsbehörde - nur nötig, falls euer Gewerbe
   * erlaubnispflichtig ist. Bei normalen Fitnessstudios üblicherweise nicht.
   */
  supervisoryAuthority: null as string | null,

  /**
   * Datenschutzbeauftragter. Pflicht i.d.R. erst ab 20 Personen, die ständig
   * mit automatisierter Datenverarbeitung beschäftigt sind - für ein einzelnes
   * Studio meist nicht erforderlich. Dann `null` lassen.
   */
  dataProtectionOfficer: null as string | null,

  /** Für die Datenschutzerklärung: Stand der letzten Aktualisierung. */
  lastUpdated: "August 2026",
} as const;

/**
 * Sichtbarer Platzhalter für fehlende Pflichtangaben. Bewusst auffällig,
 * damit fehlende Daten nicht unbemerkt live gehen.
 */
export const MISSING = "[BITTE ERGÄNZEN]";

export function legalValue(value: string | null | undefined): string {
  return value ?? MISSING;
}

/** Prüft, ob noch Pflichtangaben fehlen (steuert den Warnhinweis auf der Seite). */
export function hasMissingLegalData(): boolean {
  const { legalForm, vatId, registerCourt, registerNumber } = legalConfig;

  if (!legalForm) return true;
  // Kapitalgesellschaften müssen zusätzlich das Register angeben.
  if ((legalForm === "gmbh" || legalForm === "ug" || legalForm === "gmbh-co-kg") &&
      (!registerCourt || !registerNumber)) {
    return true;
  }
  // USt-ID ist nur anzugeben, wenn vorhanden - fehlt sie, ist das kein Fehler,
  // solange die Rechtsform geklärt ist. Kleinunternehmer haben keine.
  void vatId;

  return false;
}
