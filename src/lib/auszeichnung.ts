/**
 * Die Auszeichnung der DtGV: "Deutschlands beliebteste EMS-Studios 2026".
 *
 * WAS BELEGT IST: Die Deutsche Gesellschaft für Verbraucherstudien hat in
 * einer Kundenbefragung (Februar bis März 2026, 716 Bewertungen, sechs
 * EMS-Studio-Ketten) Körperformen auf Platz 1 der Gesamtwertung gesetzt;
 * Körperformen hat in allen Teilkategorien die beste Bewertung erhalten.
 *
 * WAS DARAN HÄNGT: Ausgezeichnet ist die Marke Körperformen, nicht ein
 * einzelnes Studio. Die Texte sagen deshalb "Körperformen", nicht "wir".
 * Die Werte der Teilkategorien stammen aus dem Bericht (Quelle unten) -
 * ändern sie sich oder kommt eine neue Befragung, hier anpassen.
 *
 * KEIN DTGV-LOGO: Das Siegel der DtGV ist ein Markenzeichen; es darf nur
 * mit Lizenz gezeigt werden. Die Seite nennt deshalb die Studie mit Quelle
 * und zeigt eine eigene Darstellung statt des Siegels.
 */

export const auszeichnung = {
  titel: "Deutschlands beliebteste EMS-Studios 2026",
  platz: "1. Platz Gesamtwertung",
  herausgeber: "Deutsche Gesellschaft für Verbraucherstudien (DtGV)",
  herausgeberKurz: "DtGV",
  art: "Kundenbefragung",
  veroeffentlicht: "09.04.2026",
  zeitraum: "Februar bis März 2026",
  bewertungen: 716,
  anbieter: 6,
  quelle: "https://www.dtgv.de/surveys/kb-ems-studios/",
  kategorien: [
    { name: "Betreuung", score: "7,71" },
    { name: "Preise & Konditionen", score: "7,47" },
    { name: "Effektivität", score: "7,49" },
    { name: "Ausstattung", score: "7,42" },
    { name: "Kundenvertrauen", score: "7,46" },
  ],
} as const;
