// Prüft, dass jede exportierte Aktion in den Admin-Dateien eine
// Rechteprüfung erreicht. Die Anzeige zu beschränken genügt nicht - wer
// eine Kennung kennt, ruft die Aktion direkt auf.
//
// Aufruf: npm run wachen
//
// Manche Dateien rufen die Prüfung über einen lokalen Helfer auf
// (requireAdmin). Deshalb wird eine Ebene weit verfolgt: Ein lokaler
// Helfer, der selbst eine Wache aufruft, zählt als Wache.
//
// WICHTIG FÜR NEUE AKTIONEN: Geprüft wird alles in src/lib/actions - wer
// eine neue Datei anlegt, wird also automatisch erfasst. Ist die Aktion
// bewusst öffentlich (ein Formular für Besucher), gehört ihr Dateiname
// unten in OEFFENTLICH. Genau dieser eine Schritt ist der Sinn der
// Übung: Dass jemand kurz innehalten und "ja, absichtlich öffentlich"
// sagen muss, statt es zu vergessen.
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Vom Skript aus nach oben, nicht von dem Ordner aus, in dem jemand
// gerade steht: "npm run wachen" soll aus jedem Unterverzeichnis laufen.
const WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ORDNER = join(WURZEL, "src/lib/actions");
const WACHEN = ["verlangeLeitungAktion", "verlangeStudioRecht", "verlangeAdminAktion"];
const AUSNAHMEN = {
  "admin-auth.ts": "Anmeldung und Abmeldung - hier gibt es noch keinen Zugang zu prüfen",
};

// Bewusst umgekehrt aufgezählt: geprüft wird ALLES im Ordner, ausgenommen
// sind namentlich die öffentlichen Aktionen. Vorher wurden nur Dateien mit
// dem Präfix "admin-" geprüft - eine neue Admin-Aktion ohne dieses Präfix
// wäre stillschweigend an der Prüfung vorbeigelaufen.
const OEFFENTLICH = new Set([
  "booking.ts",     // Anfrageformular
  "comments.ts",    // Kommentar unter einem Blogbeitrag
  "contact.ts",     // Kontaktformular
  "newsletter.ts",  // An- und Abmeldung zum Newsletter
  "termin.ts",      // Absagen und Verschieben über den persönlichen Link
  "kundenbereich.ts", // Zugangslink zu den eigenen Terminen anfordern
]);

let fehlend = 0;

for (const datei of readdirSync(ORDNER).filter((f) => f.endsWith(".ts"))) {
  if (OEFFENTLICH.has(datei)) continue;
  if (AUSNAHMEN[datei]) {
    console.log(`-  ${datei}: übersprungen (${AUSNAHMEN[datei]})`);
    continue;
  }
  const quelle = readFileSync(`${ORDNER}/${datei}`, "utf8");

  // Lokale Helfer, die selbst eine Wache aufrufen, gelten mit.
  const helfer = [...quelle.matchAll(/(?:async )?function (\w+)\s*\([^)]*\)\s*\{([\s\S]{0,400}?)\n\}/g)]
    .filter(([, , koerper]) => WACHEN.some((w) => koerper.includes(w)))
    .map(([, name]) => name);
  const alleWachen = [...WACHEN, ...helfer];

  const teile = quelle.split(/\nexport async function /).slice(1);
  const luecken = [];
  for (const teil of teile) {
    const name = teil.slice(0, teil.indexOf("("));
    const koerper = teil.slice(0, 1400);
    if (!alleWachen.some((w) => koerper.includes(w))) luecken.push(name);
  }
  fehlend += luecken.length;
  console.log(
    luecken.length === 0
      ? `ok ${datei}: ${teile.length} Aktionen${helfer.length ? ` (Wache über ${helfer.join(", ")})` : ""}`
      : `!! ${datei}: OHNE PRÜFUNG -> ${luecken.join(", ")}`,
  );
}

// Auch die Wege unter /api/admin
const API = join(WURZEL, "src/app/api/admin");
function durchsuchen(pfad) {
  for (const eintrag of readdirSync(pfad, { withFileTypes: true })) {
    const voll = `${pfad}/${eintrag.name}`;
    if (eintrag.isDirectory()) durchsuchen(voll);
    else if (eintrag.name === "route.ts") {
      const q = readFileSync(voll, "utf8");
      const hat = q.includes("aktuellerAdmin") || WACHEN.some((w) => q.includes(w));
      console.log(`${hat ? "ok" : "!!"} ${relative(WURZEL, voll)}`);
      if (!hat) fehlend++;
    }
  }
}
durchsuchen(API);

console.log(
  fehlend === 0
    ? "\nAlle Aktionen und Wege erreichen eine Rechteprüfung."
    : `\n${fehlend} ohne Prüfung!`,
);
process.exit(fehlend ? 1 : 0);
