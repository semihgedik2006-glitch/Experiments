/**
 * Antwortvorlagen und ihre Platzhalter.
 *
 * WARUM DIE WEBSITE DIESE ANTWORTEN NICHT SELBST VERSCHICKT:
 *
 * Es wäre technisch der kürzere Weg - ein Knopf, und die Mail ist raus.
 * Er ist trotzdem der falsche. Eine Antwort auf eine persönliche Anfrage
 * muss aus dem Postfach des Studios kommen:
 *
 *   - Der Interessent antwortet darauf. Kommt die Mail von der Website,
 *     landet seine Antwort bei einem Absender, den niemand liest.
 *   - Der Verlauf steht dort, wo ihn alle sehen. Wer im Studio ans Telefon
 *     geht, schaut ins Postfach, nicht in ein Adminwerkzeug.
 *   - Und sie sieht aus wie eine Nachricht von einem Menschen, weil sie
 *     eine ist. Automatisch verschickte Antworten landen bei den großen
 *     Anbietern deutlich häufiger im Werbeordner.
 *
 * Die Vorlage füllt deshalb nur das Mailprogramm vor: Empfänger, Betreff
 * und Text stehen drin, abgeschickt wird von Hand - und wer noch zwei
 * Sätze ergänzen will, tut das vorher.
 */

/**
 * Was in einer Vorlage ersetzt wird.
 *
 * Bewusst wenige und offensichtliche Namen. Ein Platzhalter, den man
 * nachschlagen muss, wird nicht benutzt; einer, der falsch geschrieben
 * wird, steht später wörtlich in der Mail beim Kunden.
 */
export const PLATZHALTER: { name: string; erklaerung: string }[] = [
  { name: "{vorname}", erklaerung: "Der erste Vorname aus der Anfrage" },
  { name: "{name}", erklaerung: "Der vollständige Name" },
  { name: "{studio}", erklaerung: "Das gewählte Studio, sonst leer" },
  { name: "{termin}", erklaerung: "Datum und Uhrzeit des Termins, sonst leer" },
];

export type VorlagenWerte = {
  name?: string | null;
  studio?: string | null;
  termin?: string | null;
};

/**
 * Platzhalter ersetzen.
 *
 * Unbekannte Platzhalter bleiben stehen. Sie stillschweigend zu löschen
 * wäre schlimmer: Dann fiele erst beim Kunden auf, dass etwas fehlt -
 * so fällt es beim Durchlesen vor dem Absenden auf.
 *
 * Ein leerer Wert wird durch eine leere Zeichenkette ersetzt, nicht durch
 * "null" oder "undefined". Eine Anfrage ohne festen Termin ist der
 * Normalfall, kein Fehler.
 */
export function vorlageFuellen(text: string, werte: VorlagenWerte): string {
  const name = (werte.name ?? "").trim();
  const vorname = name.split(/\s+/)[0] ?? "";

  return text
    .replaceAll("{vorname}", vorname)
    .replaceAll("{name}", name)
    .replaceAll("{studio}", (werte.studio ?? "").trim())
    .replaceAll("{termin}", (werte.termin ?? "").trim());
}

/**
 * Die Adresse, die das Mailprogramm öffnet.
 *
 * encodeURIComponent auf jedem Teil: Ohne das zerlegt ein "&" im Text die
 * Adresse, und alles dahinter fehlt in der Mail. Zeilenumbrüche müssen als
 * %0A ankommen, sonst steht die Antwort in einem einzigen Absatz.
 */
export function mailtoLink(an: string, betreff: string, text: string): string {
  return `mailto:${encodeURIComponent(an)}?subject=${encodeURIComponent(
    betreff,
  )}&body=${encodeURIComponent(text)}`;
}

/**
 * Vorlagen zur ersten Einrichtung.
 *
 * Sie werden NICHT automatisch angelegt: Ein Adminbereich, der beim ersten
 * Öffnen schon vier fremde Texte enthält, führt dazu, dass sie ungelesen
 * verschickt werden. Sie stehen stattdessen auf der Seite als Vorschlag
 * zum Übernehmen - wer sie anklickt, bekommt sie ins Formular und liest
 * sie dabei.
 */
export const BEISPIELE: { titel: string; betreff: string; text: string }[] = [
  {
    titel: "Preisanfrage",
    betreff: "Deine Frage zu unseren Preisen",
    text: `Hallo {vorname},

danke für deine Nachricht!

Was das Training kostet, hängt davon ab, wie oft du trainierst und was du
erreichen möchtest - deshalb nennen wir hier ungern eine Zahl, die dann
für dich gar nicht stimmt.

Am einfachsten klären wir das beim kostenlosen Probetraining: Du lernst
das Studio kennen, wir schauen uns gemeinsam an, was zu dir passt, und du
bekommst ein Angebot, das dazu gehört. Unverbindlich und ohne Vertrag.

Sag einfach Bescheid, wann es dir passt - oder ruf uns kurz an.

Viele Grüße
Dein Körperformen-Team`,
  },
  {
    titel: "Terminbestätigung nachfassen",
    betreff: "Dein Probetermin bei Körperformen",
    text: `Hallo {vorname},

wir haben versucht, dich telefonisch zu erreichen - leider ohne Erfolg.

Dein Wunschtermin: {termin}
Studio: {studio}

Schreib uns gern kurz zurück, ob der Termin so passt. Dann bestätigen wir
ihn dir sofort.

Viele Grüße
Dein Körperformen-Team`,
  },
  {
    titel: "Ist EMS das Richtige für mich?",
    betreff: "Deine Frage zum EMS-Training",
    text: `Hallo {vorname},

danke für deine Nachricht - das ist genau die richtige Frage vorab.

EMS eignet sich für die allermeisten, gerade auch für Einsteiger und für
alle, die wenig Zeit haben. Es gibt aber Fälle, in denen wir davon
abraten oder vorher eine ärztliche Rücksprache brauchen - dazu gehören
zum Beispiel ein Herzschrittmacher, eine Schwangerschaft oder akute
Entzündungen.

Am besten besprechen wir das kurz persönlich, bevor du kommst. Ruf uns
gern an, oder schreib uns, wann wir dich erreichen.

Viele Grüße
Dein Körperformen-Team`,
  },
];
