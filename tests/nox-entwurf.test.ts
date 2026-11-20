import { test } from "node:test";
import assert from "node:assert/strict";
import { entwurfPruefen, studioFinden } from "../src/lib/nox-entwurf";

test("FAQ-Entwurf braucht Frage und Antwort", () => {
  assert.deepEqual(entwurfPruefen({ art: "faq_entwurf", frage: "Was ziehe ich an?" }), { fehler: "Frage und Antwort fehlen." });
  const ok = entwurfPruefen({ art: "faq_entwurf", frage: " Was ziehe ich an? ", antwort: "Wir stellen die Kleidung.", antwortEn: "" });
  assert.deepEqual(ok, { art: "faq", frage: "Was ziehe ich an?", text: "Wir stellen die Kleidung.", frageEn: null, textEn: null });
});

test("Studio-Text kennt nur intro und anfahrt und kürzt auf die Feldgrenze", () => {
  assert.deepEqual(entwurfPruefen({ art: "studio_text", studio: "huerth", feld: "preise", text: "x" }), { fehler: "Feld ist intro oder anfahrt." });
  const lang = entwurfPruefen({ art: "studio_text", studio: "huerth", feld: "intro", text: "a".repeat(900) });
  assert.ok(!("fehler" in lang) && lang.text.length === 600);
});

test("unbekannte Art wird abgewiesen", () => {
  assert.deepEqual(entwurfPruefen({ art: "preis" }), { fehler: "Unbekannte Art." });
});

test("Studio wird über Adresse, Namen oder eindeutigen Teil gefunden", () => {
  const studios = [{ slug: "huerth", name: "Körperformen Hürth" }, { slug: "koeln-sued", name: "Körperformen Köln Süd" }, { slug: "koeln-nord", name: "Körperformen Köln Nord" }];
  assert.equal(studioFinden(studios, "huerth")?.slug, "huerth");
  assert.equal(studioFinden(studios, "körperformen köln süd")?.slug, "koeln-sued");
  assert.equal(studioFinden(studios, "Hürth")?.slug, "huerth");
  assert.equal(studioFinden(studios, "köln"), null);
});
