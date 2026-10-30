// Meldet alle Seiten aus der Sitemap per IndexNow an Bing & Co.
//
// Aufruf: INDEXNOW_KEY=... npm run indexnow
//
// Sinnvoll nach dem ersten Einrichten und immer dann, wenn sich viel
// geändert hat - etwa nachdem die Studio-Texte eingetragen sind. Sonst
// dauert es Tage bis Wochen, bis die Suchmaschinen von selbst vorbeischauen.
//
// Gemeldet wird die Live-Seite, nicht der lokale Stand: Der Schlüssel muss
// also vorher in Vercel eingetragen und neu bereitgestellt sein. Genau das
// prüft das Skript zuerst - eine Meldung mit einem Schlüssel, den die Seite
// nicht kennt, lehnt IndexNow ab, und die Fehlermeldung von dort ist wenig
// hilfreich.
const BASIS = "https://www.koerperformen-koeln.de";
const SCHLUESSEL = process.env.INDEXNOW_KEY;

if (!SCHLUESSEL) {
  console.error("INDEXNOW_KEY fehlt. Aufruf: INDEXNOW_KEY=... npm run indexnow");
  process.exit(1);
}

const hinterlegt = await fetch(`${BASIS}/indexnow.txt`);
const hinterlegterText = hinterlegt.ok ? (await hinterlegt.text()).trim() : null;
if (hinterlegterText !== SCHLUESSEL) {
  console.error(
    `${BASIS}/indexnow.txt liefert nicht diesen Schlüssel (HTTP ${hinterlegt.status}).\n` +
      "INDEXNOW_KEY in Vercel eintragen, neu bereitstellen und dann erneut versuchen.",
  );
  process.exit(1);
}

const sitemap = await fetch(`${BASIS}/sitemap.xml`).then((antwort) => antwort.text());
const urlList = [...sitemap.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map(([, adresse]) => adresse);
if (urlList.length === 0) {
  console.error(`In ${BASIS}/sitemap.xml wurden keine Seiten gefunden.`);
  process.exit(1);
}

const antwort = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: new URL(BASIS).host,
    key: SCHLUESSEL,
    keyLocation: `${BASIS}/indexnow.txt`,
    urlList,
  }),
});

// 200 = angenommen, 202 = angenommen, Schlüssel wird noch geprüft.
if (antwort.status === 200 || antwort.status === 202) {
  console.log(`${urlList.length} Seiten gemeldet (HTTP ${antwort.status}).`);
} else {
  console.error(`Abgelehnt (HTTP ${antwort.status}): ${await antwort.text()}`);
  process.exit(1);
}
