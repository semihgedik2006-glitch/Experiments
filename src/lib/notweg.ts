/**
 * Der Notweg: Was passiert, wenn die Datenbank nicht antwortet.
 *
 * Am 25.11.2026 war das Kontingent der Datenbank aufgebraucht. Die Seiten
 * liefen aus dem Zwischenspeicher weiter, aber jede Probetermin-Anfrage
 * und jede Kontaktnachricht endete in einer Fehlermeldung und war weg -
 * gespeichert wird zuerst, gemailt erst danach.
 *
 * Seitdem gilt: Lässt sich eine Anfrage nicht speichern, geht sie mit
 * allen Angaben als Mail an die Sammeladresse. Der Mailversand braucht
 * die Datenbank nicht. Erst wenn auch die Mail scheitert, sieht der
 * Besucher einen Fehler - mit der Telefonnummer.
 */

function feld(formData: FormData, name: string, laenge = 300): string {
  return String(formData.get(name) ?? "").trim().slice(0, laenge);
}

/**
 * Fehlt nur die Tabelle? Dann darf ein Standardwert gelten.
 *
 * Alles andere - Datenbank nicht erreichbar, Kontingent aufgebraucht -
 * muss ein Fehler bleiben. Sonst entsteht die Seite mit Standardtexten
 * und Standardschaltern neu und ersetzt die gute Fassung im
 * Zwischenspeicher: Ausgeblendete Bereiche wären plötzlich sichtbar.
 */
export function tabelleFehlt(error: unknown): boolean {
  const e = error as { code?: string; message?: string; cause?: { code?: string; originalCode?: string } } | null;
  if (!e) return false;
  const codes = [e.code, e.cause?.code, e.cause?.originalCode];
  if (codes.includes("P2021") || codes.includes("42P01")) return true;
  return /relation .* does not exist|table .* does not exist/i.test(e.message ?? "");
}

export type NotwegMail = { betreff: string; text: string; antwortAn: string | null };

/** Die Probetermin-Anfrage als Mail, aus den rohen Formularfeldern. */
export function notwegAnfrage(formData: FormData): NotwegMail | null {
  const name = feld(formData, "name");
  const email = feld(formData, "email");
  const phone = feld(formData, "phone");
  if (!name || !email || !phone) return null;

  const studio = feld(formData, "studioName") || (feld(formData, "studioId") ? `Kennung ${feld(formData, "studioId")}` : "nicht angegeben");
  const logxTag = feld(formData, "logxTag");
  const logxVon = feld(formData, "logxVon");
  const zeilen = [
    "ACHTUNG: Diese Anfrage konnte NICHT im Adminbereich gespeichert werden,",
    "weil die Datenbank gerade nicht antwortet. Sie steht nur in dieser Mail.",
    "Bitte ans Studio weitergeben und zurückrufen.",
    "",
    `Studio:      ${studio}`,
    `Name:        ${name}`,
    `Telefon:     ${phone}`,
    `E-Mail:      ${email}`,
    `Erreichbar:  ${feld(formData, "erreichbarkeit") || "-"}`,
    `Wunschzeit:  ${feld(formData, "terminWunsch") || "-"}`,
    logxTag && logxVon ? `Gewählte Zeit: ${logxTag} um ${logxVon} Uhr (nicht in LogX eingetragen - bitte von Hand)` : null,
    `Ziel:        ${feld(formData, "ziel") || "-"}`,
    formData.get("zuZweit") === "on" ? "Kommt zu zweit (zweites Gerät nötig)." : null,
    feld(formData, "aktionsCode") ? `Aktionscode: ${feld(formData, "aktionsCode")} (ungeprüft)` : null,
    feld(formData, "sprache") === "en" ? "Sprache:     Englisch - bitte auf Englisch anrufen." : null,
    feld(formData, "message", 1000) ? `\nNachricht:\n${feld(formData, "message", 1000)}` : null,
  ];
  return {
    betreff: `NOTWEG - Probetermin-Anfrage (${studio}), nicht gespeichert`,
    text: zeilen.filter((z): z is string => z !== null).join("\n"),
    antwortAn: email,
  };
}

/** Die Kontaktnachricht als Mail, aus den rohen Formularfeldern. */
export function notwegKontakt(formData: FormData): NotwegMail | null {
  const name = feld(formData, "name");
  const email = feld(formData, "email");
  const betreff = feld(formData, "subject");
  const message = feld(formData, "message", 5000);
  if (!name || !email || !betreff || !message) return null;
  const phone = feld(formData, "phone");
  return {
    betreff: `NOTWEG - Kontaktnachricht, nicht gespeichert: ${betreff}`,
    text: [
      "ACHTUNG: Diese Nachricht konnte NICHT im Adminbereich gespeichert werden,",
      "weil die Datenbank gerade nicht antwortet. Sie steht nur in dieser Mail.",
      "",
      `Name:    ${name}`,
      `E-Mail:  ${email}`,
      phone ? `Telefon: ${phone}` : null,
      `Betreff: ${betreff}`,
      feld(formData, "sprache") === "en" ? "Sprache: Englisch" : null,
      "",
      message,
    ].filter((z): z is string => z !== null).join("\n"),
    antwortAn: email,
  };
}

/** Was der Besucher liest, wenn weder Speichern noch Mail geklappt hat. */
export function notwegFehlermeldung(en: boolean, telefon: string): string {
  return en
    ? `Sorry, we could not receive your request just now. Please call us on ${telefon} - we will sort it out right away.`
    : `Deine Anfrage ist gerade leider nicht bei uns angekommen. Bitte ruf uns an unter ${telefon} - dann klären wir es direkt.`;
}
