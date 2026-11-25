import { test } from "node:test";
import assert from "node:assert/strict";
import { notwegAnfrage, notwegFehlermeldung, notwegKontakt, tabelleFehlt } from "../src/lib/notweg";
import { adressenAusSitemap, seitenAufwaermen } from "../src/lib/aufwaermen";

function formular(felder: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(felder)) f.set(k, v);
  return f;
}

test("Notweg: Anfrage steht vollständig in der Mail", () => {
  const mail = notwegAnfrage(
    formular({
      name: "Test Person", email: "test@example.org", phone: "0170 000", studioId: "abc", studioName: "Körperformen Hürth",
      erreichbarkeit: "abends", terminWunsch: "Mo, Mi · Nach Feierabend", ziel: "ruecken", zuZweit: "on",
      aktionsCode: "SOMMER", sprache: "en", message: "Hallo",
    }),
  );
  assert.ok(mail);
  assert.match(mail.betreff, /NOTWEG/);
  assert.match(mail.betreff, /Körperformen Hürth/);
  for (const teil of ["Test Person", "0170 000", "test@example.org", "abends", "Mo, Mi", "ruecken", "zu zweit", "SOMMER", "Englisch", "Hallo", "NICHT im Adminbereich"]) {
    assert.ok(mail.text.includes(teil), teil);
  }
  assert.equal(mail.antwortAn, "test@example.org");
});

test("Notweg: ohne Studioname steht die Kennung da, ohne Pflichtfeld gibt es keine Mail", () => {
  const mail = notwegAnfrage(formular({ name: "A", email: "a@b.de", phone: "1", studioId: "xyz", logxTag: "2026-12-01", logxVon: "18:00" }));
  assert.ok(mail?.text.includes("Kennung xyz"));
  assert.ok(mail?.text.includes("2026-12-01 um 18:00 Uhr"));
  assert.equal(notwegAnfrage(formular({ name: "A", email: "a@b.de" })), null);
});

test("Notweg: Kontaktnachricht", () => {
  const mail = notwegKontakt(formular({ name: "A", email: "a@b.de", subject: "Frage", message: "Text", phone: "123" }));
  assert.ok(mail);
  assert.match(mail.betreff, /Frage/);
  assert.ok(mail.text.includes("Telefon: 123"));
  assert.equal(notwegKontakt(formular({ name: "A", email: "a@b.de", subject: "Frage" })), null);
});

test("Notweg: Fehlermeldung nennt die Telefonnummer", () => {
  assert.ok(notwegFehlermeldung(false, "+49 1").includes("+49 1"));
  assert.ok(notwegFehlermeldung(true, "+49 1").includes("call us on +49 1"));
});

test("Nur eine fehlende Tabelle darf zu Standardwerten führen", () => {
  assert.equal(tabelleFehlt({ code: "P2021" }), true);
  assert.equal(tabelleFehlt({ cause: { originalCode: "42P01" } }), true);
  assert.equal(tabelleFehlt(new Error('relation "SiteToggle" does not exist')), true);
  assert.equal(tabelleFehlt({ cause: { originalCode: "53000" }, message: "Your account or project has exceeded the quota." }), false);
  assert.equal(tabelleFehlt({ code: "P1001", message: "Can't reach database server" }), false);
  assert.equal(tabelleFehlt(null), false);
});

test("Aufwärmen: nur eigene Adressen aus der Sitemap", () => {
  const xml = "<urlset><url><loc>https://seite.test/</loc></url><url><loc> https://seite.test/a?x=1&amp;y=2 </loc></url><url><loc>https://fremd.test/b</loc></url><url><loc>https://seite.test/</loc></url></urlset>";
  assert.deepEqual(adressenAusSitemap(xml, "https://seite.test"), ["https://seite.test/", "https://seite.test/a?x=1&y=2"]);
});

test("Aufwärmen: ruft jede Seite einmal auf und zählt Fehler", async () => {
  const gesehen: string[] = [];
  const abrufen = (async (adresse: string | URL | Request) => {
    const a = String(adresse);
    gesehen.push(a);
    if (a.endsWith("/sitemap.xml")) return new Response("<loc>https://seite.test/</loc><loc>https://seite.test/a</loc><loc>https://seite.test/kaputt</loc>");
    if (a.endsWith("/kaputt")) return new Response("x", { status: 500 });
    return new Response("ok");
  }) as typeof fetch;
  const ergebnis = await seitenAufwaermen("https://seite.test", { abrufen, gleichzeitig: 2 });
  assert.deepEqual(ergebnis, { seiten: 3, ok: 2, fehler: 1, abgebrochen: false });
  assert.equal(gesehen.length, 4);
});
