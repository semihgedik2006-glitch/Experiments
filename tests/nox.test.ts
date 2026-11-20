import { test } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import { noxSignaturPruefen, noxText, ohnePersonendaten, tagesbeginnKoeln } from "../src/lib/nox";

const { publicKey, privateKey } = generateKeyPairSync("ed25519");
const oeffentlich = Buffer.from(publicKey.export({ format: "jwk" }).x as string, "base64url").toString("base64");

function signiert(zeit: string, methode: string, pfad: string, body: string) {
  return sign(null, Buffer.from(noxText(zeit, methode, pfad, body)), privateKey).toString("base64");
}

test("gültige Signatur wird angenommen", () => {
  const zeit = String(Date.now());
  const signatur = signiert(zeit, "GET", "/api/nox?seit=x", "");
  assert.equal(noxSignaturPruefen({ oeffentlich, zeit, signatur, methode: "GET", pfad: "/api/nox?seit=x", body: "" }), true);
});

test("veränderter Pfad, Body oder alte Zeit wird abgewiesen", () => {
  const zeit = String(Date.now());
  const signatur = signiert(zeit, "POST", "/api/nox", '{"a":1}');
  const basis = { oeffentlich, zeit, signatur, methode: "POST", pfad: "/api/nox", body: '{"a":1}' };
  assert.equal(noxSignaturPruefen(basis), true);
  assert.equal(noxSignaturPruefen({ ...basis, body: '{"a":2}' }), false);
  assert.equal(noxSignaturPruefen({ ...basis, pfad: "/api/nox?x" }), false);
  assert.equal(noxSignaturPruefen({ ...basis, methode: "GET" }), false);
  assert.equal(noxSignaturPruefen({ ...basis, jetzt: Number(zeit) + 6 * 60_000 }), false);
});

test("fehlender Schlüssel oder Müll wird abgewiesen", () => {
  const zeit = String(Date.now());
  assert.equal(noxSignaturPruefen({ oeffentlich: undefined, zeit, signatur: "x", methode: "GET", pfad: "/", body: "" }), false);
  assert.equal(noxSignaturPruefen({ oeffentlich, zeit, signatur: "AAAA", methode: "GET", pfad: "/", body: "" }), false);
  assert.equal(noxSignaturPruefen({ oeffentlich: "kaputt", zeit, signatur: "AAAA", methode: "GET", pfad: "/", body: "" }), false);
});

test("Mailadressen und Nummern werden entfernt", () => {
  assert.equal(ohnePersonendaten("an max@beispiel.de / 0176 1234567 gescheitert"), "an [Mail] / [Nummer] gescheitert");
});

test("Tagesbeginn in Köln", () => {
  assert.equal(tagesbeginnKoeln(new Date("2026-11-10T10:00:00Z")).toISOString(), "2026-11-09T23:00:00.000Z");
  assert.equal(tagesbeginnKoeln(new Date("2026-07-01T23:30:00Z")).toISOString(), "2026-07-01T22:00:00.000Z");
});
