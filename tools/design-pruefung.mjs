#!/usr/bin/env node
// Aufruf: node tools/design-pruefung.mjs <datei.html|URL> [...] [--breiten 390,1440] [--profil nox] [--aus ordner]
//         node tools/design-pruefung.mjs --selbsttest
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile, stat } from "node:fs/promises";
import { resolve, relative, extname, join, basename } from "node:path";

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = await import("playwright")); }

const HILFE = `Design-Prüfung
  node tools/design-pruefung.mjs <datei.html|URL> [...]
    --breiten 320,390,430,820,1280,1440,1920   Standard: 390,1440
    --profil nox                               Hausregeln von Nox (Apple-Look) zusätzlich prüfen
    --schema dunkel|hell                       prefers-color-scheme setzen
    --aus <ordner>                             Standard: design-pruefung/ (Screenshots, bericht.md, bericht.json)
    --wurzel <ordner>                          Ordner, der für lokale Dateien ausgeliefert wird (Standard: .)
    --basis </pfad>                            Pfad-Präfix der Live-Seite, z. B. /bauwerk-previews für GitHub Pages
    --warten <ms>                              nach dem Laden warten (Standard 600)
    --vorher <datei.mjs>                       exportiert vor(page), nach(page), erlaubt (Liste von RegExp für bekannte Meldungen)
    --ruhig                                    prefers-reduced-motion: reduce (Endzustand bei Scroll-Animationen)
    --nur-bericht                              Exit-Code 0 trotz Fehlern
  node tools/design-pruefung.mjs --selbsttest`;

function argumente(argv) {
  const o = { ziele: [], breiten: [390, 1440], profil: "", schema: "", aus: "design-pruefung", wurzel: ".", basis: "", warten: 600, vorher: "", nurBericht: false, ruhig: false, selbsttest: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--breiten") o.breiten = argv[++i].split(",").map(Number).filter(Boolean);
    else if (a === "--profil") o.profil = argv[++i];
    else if (a === "--schema") o.schema = argv[++i];
    else if (a === "--aus") o.aus = argv[++i];
    else if (a === "--wurzel") o.wurzel = argv[++i];
    else if (a === "--basis") o.basis = "/" + argv[++i].replace(/^\/+|\/+$/g, "");
    else if (a === "--warten") o.warten = Number(argv[++i]);
    else if (a === "--vorher") o.vorher = argv[++i];
    else if (a === "--nur-bericht") o.nurBericht = true;
    else if (a === "--ruhig") o.ruhig = true;
    else if (a === "--selbsttest") o.selbsttest = true;
    else if (a === "-h" || a === "--hilfe" || a === "--help") { console.log(HILFE); process.exit(0); }
    else o.ziele.push(a);
  }
  return o;
}

const TYPEN = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".ico": "image/x-icon", ".woff2": "font/woff2", ".woff": "font/woff", ".mp4": "video/mp4", ".webm": "video/webm", ".webmanifest": "application/manifest+json" };

function server(wurzel, speicher = {}, basis = "") {
  return new Promise((ok) => {
    const s = createServer(async (req, res) => {
      let pfad = decodeURIComponent(new URL(req.url, "http://x").pathname);
      if (basis && pfad.startsWith(basis + "/")) pfad = pfad.slice(basis.length);
      if (speicher[pfad] !== undefined) { res.writeHead(200, { "content-type": "text/html; charset=utf-8" }); return res.end(speicher[pfad]); }
      let datei = resolve(wurzel, "." + pfad);
      if (!datei.startsWith(resolve(wurzel))) { res.writeHead(403); return res.end(); }
      try { if ((await stat(datei)).isDirectory()) datei = join(datei, "index.html"); res.writeHead(200, { "content-type": TYPEN[extname(datei).toLowerCase()] ?? "application/octet-stream" }); res.end(await readFile(datei)); }
      catch { res.writeHead(404); res.end(); }
    });
    s.listen(0, "127.0.0.1", () => ok(s));
  });
}

function messenImBrowser({ breite, profil }) {
  const mobil = breite <= 820;
  const befunde = [];
  const melde = (stufe, art, text, el) => befunde.push({ stufe, art, text, wo: el ? wer(el) : "" });
  function wer(el) {
    if (!el || el.nodeType !== 1) return "";
    let s = el.tagName.toLowerCase();
    if (el.id) s += "#" + el.id;
    else if (el.classList.length) s += "." + [...el.classList].slice(0, 2).join(".");
    const t = (el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40);
    return t ? `${s} „${t}“` : s;
  }
  const sichtbar = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    const c = getComputedStyle(el);
    return c.visibility !== "hidden" && c.display !== "none" && Number(c.opacity) > 0.05 && !el.closest("[hidden],[inert],[aria-hidden=true]");
  };
  const farbe = (s) => {
    const m = s.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const t = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return { r: t[0], g: t[1], b: t[2], a: t[3] ?? 1 };
  };
  const misch = (o, u) => ({ r: o.r * o.a + u.r * (1 - o.a), g: o.g * o.a + u.g * (1 - o.a), b: o.b * o.a + u.b * (1 - o.a), a: 1 });
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const verh = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

  const doc = document.documentElement;
  if (doc.scrollWidth > innerWidth + 1) {
    const zu = [...document.body.querySelectorAll("*")].filter((e) => sichtbar(e) && e.getBoundingClientRect().right > innerWidth + 1 && !e.closest("[style*=overflow],.scroll,[data-scroll]")).slice(0, 3);
    melde("fehler", "Überlauf", `Seite ist ${doc.scrollWidth}px breit bei ${innerWidth}px Fenster (waagerechtes Scrollen)`, zu[0]);
  }

  const meta = document.querySelector('meta[name=viewport]');
  if (!meta) melde("fehler", "Barrierefreiheit", "meta viewport fehlt");
  else if (/user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?\b/.test(meta.content)) melde("fehler", "Barrierefreiheit", "Zoomen ist gesperrt (user-scalable/maximum-scale)");
  if (!doc.lang) melde("fehler", "Barrierefreiheit", "<html lang> fehlt");
  if (!document.title.trim()) melde("warnung", "Barrierefreiheit", "<title> ist leer");

  const ziele = [...document.querySelectorAll('a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button],[role=link],[role=tab],[role=switch],[role=checkbox],[tabindex]:not([tabindex="-1"])')].filter(sichtbar);
  const name = (el) => {
    const l = el.getAttribute("aria-labelledby");
    if (l) return l.split(/\s+/).map((i) => document.getElementById(i)?.textContent ?? "").join(" ").trim();
    return (el.getAttribute("aria-label") || el.innerText || el.value || el.getAttribute("title") || el.querySelector("img[alt]")?.alt || el.querySelector("svg title")?.textContent || "").trim();
  };
  let geprueft = 0;
  for (const el of ziele.slice(0, 400)) {
    const tag = el.tagName.toLowerCase();
    const feld = ["input", "select", "textarea"].includes(tag);
    if (feld) {
      const typ = (el.type || "").toLowerCase();
      const hatLabel = el.labels?.length || el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || el.title || ["submit", "button", "reset"].includes(typ) && el.value;
      if (!hatLabel) melde(el.placeholder ? "warnung" : "fehler", "Barrierefreiheit", el.placeholder ? "Eingabefeld nur mit Platzhalter, ohne Label" : "Eingabefeld ohne Label", el);
    } else if (!name(el)) melde("fehler", "Barrierefreiheit", "Bedienelement ohne lesbaren Namen (aria-label fehlt)", el);

    const c = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const imText = tag === "a" && c.display === "inline" && el.parentElement && (el.parentElement.innerText || "").trim().length > (el.innerText || "").trim().length + 15;
    if (imText || el.disabled || ["checkbox", "radio"].includes(el.type) && el.labels?.length) continue;
    geprueft++;
    const kurz = Math.min(r.width, r.height);
    const grenze = mobil ? 44 : 24;
    if (kurz < grenze) melde(mobil && kurz >= 24 ? "fehler" : "fehler", "Trefferfläche", `${Math.round(r.width)}×${Math.round(r.height)} px, nötig ${grenze}×${grenze}`, el);
    else if (!mobil && kurz < 32) melde("warnung", "Trefferfläche", `${Math.round(r.width)}×${Math.round(r.height)} px am Rechner, angenehm sind 32 px und mehr`, el);
    const y = r.top + r.height / 2, x = r.left + r.width / 2;
    if (y > 0 && y < innerHeight && x > 0 && x < innerWidth) {
      const oben = document.elementFromPoint(x, y);
      if (oben && oben !== el && !el.contains(oben) && !oben.contains(el) && !(el.labels && [...el.labels].some((l) => l.contains(oben)))) { let schwebt = false; for (let u = oben; u; u = u.parentElement) if (getComputedStyle(u).position === "fixed") { schwebt = true; break; } melde(schwebt ? "warnung" : "fehler", "Trefferfläche", `Mitte ist verdeckt von ${wer(oben)}${schwebt ? " (schwebt, beim Scrollen frei)" : ""}`, el); }
    }
  }

  for (const img of document.querySelectorAll("img")) {
    if (!sichtbar(img)) continue;
    if (!img.hasAttribute("alt")) melde("fehler", "Barrierefreiheit", "Bild ohne alt-Attribut", img);
    if (img.complete && img.naturalWidth === 0) melde("fehler", "Kaputt", `Bild lädt nicht: ${img.currentSrc || img.src}`, img);
  }
  const hs = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter(sichtbar);
  if (!hs.some((h) => h.tagName === "H1")) melde("warnung", "Barrierefreiheit", "keine sichtbare <h1>");
  for (let i = 1; i < hs.length; i++) if (+hs[i].tagName[1] > +hs[i - 1].tagName[1] + 1) { melde("warnung", "Barrierefreiheit", `Überschrift springt von ${hs[i - 1].tagName} auf ${hs[i].tagName}`, hs[i]); break; }
  const ids = {};
  for (const e of document.querySelectorAll("[id]")) ids[e.id] = (ids[e.id] || 0) + 1;
  const doppelt = Object.keys(ids).filter((k) => ids[k] > 1);
  if (doppelt.length) melde("warnung", "Barrierefreiheit", `doppelte id: ${doppelt.slice(0, 5).join(", ")}`);
  let fokus = false;
  try { for (const s of document.styleSheets) for (const regel of s.cssRules) if (/:focus/.test(regel.cssText)) { fokus = true; break; } } catch { fokus = true; }
  if (!fokus) melde("warnung", "Barrierefreiheit", "keine :focus-visible-Regel gefunden, Tastatur-Fokus womöglich unsichtbar");

  const unsicher = [];
  const gesehen = new Set();
  let texte = 0, klein = 0;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const el = walker.currentNode.parentElement;
    if (!walker.currentNode.textContent.trim() || !el || gesehen.has(el) || ["SCRIPT", "STYLE", "NOSCRIPT", "OPTION"].includes(el.tagName)) continue;
    gesehen.add(el);
    if (!sichtbar(el) || el.closest("[disabled],[aria-disabled=true]")) continue;
    texte++;
    const c = getComputedStyle(el);
    const groesse = parseFloat(c.fontSize);
    if (groesse < 11.5) { klein++; if (klein <= 3) melde("warnung", "Lesbarkeit", `Schrift ${groesse}px, unter 12px ist auf dem Handy schwer lesbar`, el); }
    if (texte > 600) continue;
    let fg = farbe(c.color);
    if (!fg) continue;
    let deck = 1, beschnitten = false;
    for (let e = el; e; e = e.parentElement) { const s = getComputedStyle(e); deck *= Number(s.opacity); if (s.clipPath !== "none" || s.mixBlendMode !== "normal") beschnitten = true; }
    if (deck < 0.3) continue;
    fg = { ...fg, a: fg.a * deck };
    const schichten = [];
    let bild = beschnitten;
    const rr = el.getBoundingClientRect();
    let fest = false;
    for (let e = el; e; e = e.parentElement) if (/fixed|sticky/.test(getComputedStyle(e).position)) { fest = true; break; }
    scrollTo(0, fest ? 0 : scrollY + rr.top + rr.height / 2 - innerHeight / 2);
    const r2 = el.getBoundingClientRect();
    const px = Math.min(Math.max(r2.left + Math.min(r2.width, 40) / 2, 1), innerWidth - 1), py = r2.top + r2.height / 2;
    if (py > 0 && py < innerHeight) {
      for (const u of document.elementsFromPoint(px, py)) {
        if (u === el || el.contains(u)) continue;
        const us = getComputedStyle(u);
        if (u.contains(el)) { if ((farbe(us.backgroundColor)?.a ?? 0) >= 1) break; continue; }
        if (/^(IMG|VIDEO|CANVAS|svg|PICTURE|IFRAME)$/.test(u.tagName) || us.backgroundImage !== "none" || (farbe(us.backgroundColor)?.a ?? 0) > 0) { bild = true; break; }
      }
    }
    for (let e = el; e && !bild; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.backgroundImage !== "none" || (s.backdropFilter && s.backdropFilter !== "none") || e.tagName === "VIDEO" || e.tagName === "CANVAS") { bild = true; break; }
      const b = farbe(s.backgroundColor);
      if (b && b.a > 0) { schichten.push(b); if (b.a >= 1) break; }
    }
    const gross = groesse >= 24 || (groesse >= 18.66 && Number(c.fontWeight) >= 700);
    const soll = gross ? 3 : 4.5;
    if (bild || !schichten.length || schichten.at(-1).a < 1) {
      if (bild) { unsicher.push({ i: unsicher.length, soll, fg }); el.dataset.dpKontrast = String(unsicher.length - 1); continue; }
      schichten.push(farbe(getComputedStyle(document.body).backgroundColor)?.a ? farbe(getComputedStyle(document.body).backgroundColor) : farbe(getComputedStyle(doc).backgroundColor)?.a ? farbe(getComputedStyle(doc).backgroundColor) : { r: 255, g: 255, b: 255, a: 1 });
    }
    let bg = { ...schichten.at(-1), a: 1 };
    for (let i = schichten.length - 2; i >= 0; i--) bg = misch(schichten[i], bg);
    const v = verh(misch(fg, bg), bg);
    if (v < soll) melde("fehler", "Kontrast", `${v.toFixed(2)} : 1, nötig ${soll} : 1`, el);
  }

  const versteckt = (e) => { const r = e.getBoundingClientRect(); return r.width <= 2 || r.height <= 2 || getComputedStyle(e).clip !== "auto"; };
  let ab = 0, raus = 0;
  for (const e of document.body.querySelectorAll("*")) {
    if (e.children.length > 3 || !(e.innerText || "").trim() || !sichtbar(e) || versteckt(e) || e.matches("input,textarea,select")) continue;
    const s = getComputedStyle(e);
    if (e.scrollWidth <= e.clientWidth + 2 || !e.clientWidth || s.display === "inline") continue;
    if (/hidden|clip/.test(s.overflowX)) { if (s.textOverflow !== "ellipsis" && ab++ < 5) melde("warnung", "Abgeschnitten", `Text ragt ${e.scrollWidth - e.clientWidth}px über den Rand und wird abgeschnitten`, e); }
  }
  for (const e of document.body.querySelectorAll("*")) {
    if (e.children.length || !(e.textContent || "").trim() || !sichtbar(e) || versteckt(e) || raus >= 5) continue;
    let kasten = null;
    for (let a = e, n = 0; a && a !== document.body && n < 5; a = a.parentElement, n++) {
      const k = getComputedStyle(a);
      if ((farbe(k.backgroundColor)?.a ?? 0) > 0 || parseFloat(k.borderLeftWidth) > 0 || a.matches("button,[role=button],[role=tab]")) { kasten = a; break; }
    }
    if (!kasten || /hidden|clip|auto|scroll/.test(getComputedStyle(kasten).overflowX)) continue;
    const bereich = document.createRange(); bereich.selectNodeContents(e);
    const t = bereich.getBoundingClientRect(), k = kasten.getBoundingClientRect();
    const ueber = Math.max(t.right - k.right, k.left - t.left);
    if (ueber > 1.5) { raus++; melde("fehler", "Abgeschnitten", `Text ragt ${Math.round(ueber)}px aus seinem Kasten (${wer(kasten).split(" ")[0]}) und überlappt die Nachbarn`, e); }
  }

  const werte = {};
  for (const e of [...document.body.querySelectorAll("*")].filter(sichtbar).slice(0, 1500)) {
    const s = getComputedStyle(e);
    for (const k of ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "marginTop", "marginBottom", "rowGap", "columnGap"]) {
      const v = parseFloat(s[k]);
      if (v > 0 && Number.isFinite(v)) werte[Math.round(v)] = (werte[Math.round(v)] || 0) + 1;
    }
  }
  const alle = Object.entries(werte);
  const schief = alle.filter(([v]) => v % 2 && v > 2).sort((a, b) => b[1] - a[1]);
  const summe = alle.reduce((n, [, z]) => n + z, 0);
  const anteil = summe ? schief.reduce((n, [, z]) => n + z, 0) / summe : 0;
  if (anteil > 0.15) melde("warnung", "Abstände", `${Math.round(anteil * 100)} % der Abstände liegen nicht im 2-px-Raster (häufig: ${schief.slice(0, 5).map(([v]) => v + "px").join(", ")})`);
  const abstaende = { verschiedene: alle.length, haeufig: alle.sort((a, b) => b[1] - a[1]).slice(0, 8).map(([v]) => +v) };
  if (alle.length > 24) melde("warnung", "Abstände", `${alle.length} verschiedene Abstandswerte, eine ruhige Seite kommt mit etwa 8 bis 12 aus`);

  if (profil === "nox") {
    const glasOk = /kopf|header|menu|menü|leiste|hinweis|toast|dialog|popover|befehl|insel|bar|blatt|sheet|nav/i;
    const elemente = [...document.body.querySelectorAll("*")].filter(sichtbar);
    const gesperrt = new Set();
    for (const e of elemente.slice(0, 3000)) {
      const s = getComputedStyle(e);
      const kenn = `${e.tagName} ${e.id} ${e.className} ${e.getAttribute("role") || ""}`;
      if (s.backdropFilter && s.backdropFilter !== "none" && !/^(HEADER|NAV|DIALOG)/.test(kenn) && !glasOk.test(kenn) && !/dialog|menu|toolbar|status|alert/.test(e.getAttribute("role") || ""))
        melde("warnung", "Apple-Look", "Glas (backdrop-filter) außerhalb von Kopfleiste, Menü, Befehlsleiste oder Hinweis", e);
      if (/polygon/.test(s.clipPath)) melde("fehler", "Apple-Look", "schräge Ecken (clip-path polygon)", e);
      if (/repeating-(linear|radial)-gradient/.test(s.backgroundImage)) melde("fehler", "Apple-Look", "Raster oder Scanlinien (repeating-gradient)", e);
      for (const sch of [s.boxShadow, s.textShadow]) {
        if (!sch || sch === "none") continue;
        for (const teil of sch.split(/,(?![^(]*\))/)) {
          const f = farbe(teil);
          const zahlen = teil.replace(/rgba?\([^)]*\)/, "").match(/-?[\d.]+px/g)?.map(parseFloat) ?? [];
          const unschaerfe = zahlen[2] ?? 0;
          if (f && f.a > 0.2 && unschaerfe >= 8 && Math.max(f.r, f.g, f.b) - Math.min(f.r, f.g, f.b) > 40 && !/inset/.test(teil)) { melde("fehler", "Apple-Look", "farbiger Glow (Schatten mit Farbe und Unschärfe)", e); break; }
        }
      }
      if (s.textTransform === "uppercase" && parseFloat(s.letterSpacing) > 0.05 * parseFloat(s.fontSize) && (e.innerText || "").trim() && !gesperrt.has(s.fontSize)) { gesperrt.add(s.fontSize); melde("fehler", "Apple-Look", "gesperrte Großbuchstaben-Beschriftung", e); }
      if (e.matches("button,a,[role=button],h1,h2,h3,li") && /\p{Extended_Pictographic}/u.test(e.innerText || "") && !e.closest("[data-emoji-ok],.nachricht,.chat")) melde("fehler", "Apple-Look", "Emoji als Symbol", e);
      if (e.matches("button,[role=button],a.knopf,.knopf") && /[→←↗↘›»⟶➜➔⇢]/.test(e.innerText || "")) melde("fehler", "Apple-Look", "Pfeil im Knopf", e);
      if (e.matches("button,[role=button]") && s.borderRadius === "0px" && s.backgroundColor !== "rgba(0, 0, 0, 0)") melde("warnung", "Apple-Look", "Knopf mit eckigen Kanten", e);
      if (s.display === "grid" && s.gridTemplateColumns.split(" ").length >= 3 && e.children.length >= 6 && [...e.children].slice(0, 3).every((k) => { const ks = getComputedStyle(k); return ks.backgroundColor !== "rgba(0, 0, 0, 0)" && parseFloat(ks.borderRadius) > 0; }))
        melde("warnung", "Apple-Look", "Kachelraster, die Hausregel will ruhige Listen", e);
    }
    const schrift = getComputedStyle(document.body).fontFamily;
    if (!/-apple-system|system-ui|BlinkMacSystemFont|SF Pro/.test(schrift)) melde("warnung", "Apple-Look", `Grundschrift ist nicht die Systemschrift (${schrift.slice(0, 50)})`);
  }

  return { befunde, unsicher: unsicher.length, statistik: { bedienelemente: ziele.length, trefferGeprueft: geprueft, texte, abstaende } };
}

async function pixelKontrast(page) {
  const n = await page.evaluate(() => document.querySelectorAll("[data-dp-kontrast]").length);
  const befunde = [];
  for (let i = 0; i < Math.min(n, 40); i++) {
    const sel = `[data-dp-kontrast="${i}"]`;
    const el = page.locator(sel).first();
    try {
      await el.scrollIntoViewIfNeeded({ timeout: 1500 });
      const info = await el.evaluate((e) => {
        const c = getComputedStyle(e), r = e.getBoundingClientRect();
        const gross = parseFloat(c.fontSize) >= 24 || (parseFloat(c.fontSize) >= 18.66 && Number(c.fontWeight) >= 700);
        return { farbe: c.color, soll: gross ? 3 : 4.5, w: r.width, h: r.height, wer: e.tagName.toLowerCase() + (e.className ? "." + String(e.className).split(" ")[0] : "") + " „" + (e.innerText || "").trim().slice(0, 40) + "“" };
      });
      if (info.w < 2 || info.h < 2) continue;
      await el.evaluate((e) => { e.__dpAlt = ["transition", "color", "text-shadow"].map((k) => [k, e.style.getPropertyValue(k), e.style.getPropertyPriority(k)]); e.style.setProperty("transition", "none", "important"); });
      const mitText = await el.screenshot({ timeout: 2000, animations: "disabled" });
      await el.evaluate((e) => { e.style.setProperty("color", "transparent", "important"); e.style.setProperty("text-shadow", "none", "important"); });
      const ohneText = await el.screenshot({ timeout: 2000, animations: "disabled" });
      await el.evaluate((e) => { for (const [k, v, p] of e.__dpAlt) v ? e.style.setProperty(k, v, p) : e.style.removeProperty(k); delete e.__dpAlt; });
      const v = await page.evaluate(async ([a, b]) => {
        const lade = (d) => new Promise((ok) => { const im = new Image(); im.onload = () => ok(im); im.src = "data:image/png;base64," + d; });
        const [x, y] = await Promise.all([lade(a), lade(b)]);
        const daten = (im) => { const c = document.createElement("canvas"); c.width = im.width; c.height = im.height; const k = c.getContext("2d"); k.drawImage(im, 0, 0); return k.getImageData(0, 0, im.width, im.height).data; };
        const p = daten(x), q = daten(y);
        const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
        const L = (d, i) => 0.2126 * f(d[i]) + 0.7152 * f(d[i + 1]) + 0.0722 * f(d[i + 2]);
        let schlecht = 1e9, n = 0;
        const paare = [];
        for (let i = 0; i < p.length; i += 4) {
          const t = L(p, i), h = L(q, i);
          if (Math.abs(t - h) < 0.02) continue;
          paare.push((Math.max(t, h) + 0.05) / (Math.min(t, h) + 0.05));
          n++;
        }
        if (n < 8) return null;
        paare.sort((a, b) => b - a);
        schlecht = paare[Math.floor(paare.length * 0.1)];
        return schlecht;
      }, [mitText.toString("base64"), ohneText.toString("base64")]);
      if (v !== null && v < info.soll) befunde.push({ stufe: "fehler", art: "Kontrast", text: `${v.toFixed(2)} : 1 auf Verlauf/Bild/Glas (an Bildpunkten gemessen), nötig ${info.soll} : 1`, wo: info.wer });
    } catch {}
  }
  return { befunde, gemessen: Math.min(n, 40) };
}

async function pruefeSeite(browser, url, name, o) {
  const ergebnisse = [];
  for (const breite of o.breiten) {
    const hoehe = breite <= 430 ? 844 : breite <= 820 ? 1180 : breite >= 1920 ? 1080 : 900;
    const ctx = await browser.newContext({ viewport: { width: breite, height: hoehe }, deviceScaleFactor: 1, colorScheme: o.schema === "hell" ? "light" : o.schema === "dunkel" ? "dark" : undefined, hasTouch: breite <= 820, isMobile: breite <= 820, reducedMotion: o.ruhig ? "reduce" : "no-preference" });
    const page = await ctx.newPage();
    const konsole = [];
    let misst = false;
    const eigen = new URL(url).origin;
    page.on("console", (m) => { if (!misst && m.type() === "error" && !/^Failed to load resource/.test(m.text())) konsole.push({ stufe: "fehler", art: "Konsole", text: m.text().slice(0, 200), wo: "" }); });
    page.on("pageerror", (e) => konsole.push({ stufe: "fehler", art: "Konsole", text: String(e.message).slice(0, 200), wo: "" }));
    page.on("response", (r) => { if (r.status() >= 400) konsole.push({ stufe: r.url().startsWith(eigen) ? "fehler" : "warnung", art: "Kaputt", text: `${r.status()} ${r.url().slice(0, 140)}`, wo: "" }); });
    page.on("requestfailed", (r) => { if (r.url().startsWith(eigen) && !konsole.some((k) => k.text.includes(r.url().slice(0, 140)))) konsole.push({ stufe: "fehler", art: "Kaputt", text: `lädt nicht: ${r.url().slice(0, 140)}`, wo: "" }); });
    const hilfe = o.vorher ? await import(resolve(o.vorher)) : {};
    if (hilfe.vor) await hilfe.vor(page, { breite });
    try { await page.goto(url, { waitUntil: "networkidle", timeout: 20000 }); }
    catch { try { await page.goto(url, { waitUntil: "load", timeout: 20000 }); } catch (e) { konsole.push({ stufe: "fehler", art: "Laden", text: String(e.message).slice(0, 160), wo: "" }); } }
    await page.waitForTimeout(o.warten);
    if (hilfe.nach) { await hilfe.nach(page, { breite }); await page.waitForTimeout(200); }
    const bild = join(o.aus, `${name}-${breite}.png`);
    await page.evaluate(async () => {
      const warte = (ms) => new Promise((ok) => setTimeout(ok, ms));
      for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.7) { scrollTo(0, y); await warte(60); }
      scrollTo(0, 0); await warte(250);
      const stand = () => [...document.querySelectorAll("[style]")].map(e => getComputedStyle(e).opacity + getComputedStyle(e).transform).join();
      for (let i = 0, a = stand(); i < 40; i++) { await warte(100); const b = stand(); if (b === a) break; a = b; }
      for (const a of document.getAnimations()) { try { a.finish(); } catch {} }
    });
    misst = true;
    const m = await page.evaluate(messenImBrowser, { breite, profil: o.profil });
    const px = await pixelKontrast(page);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: bild, fullPage: true }).catch(() => page.screenshot({ path: bild }));
    await ctx.close();
    const befunde = [...konsole, ...m.befunde, ...px.befunde];
    const erlaubt = hilfe.erlaubt ?? [];
    const eindeutig = [...new Map(befunde.filter((b) => !erlaubt.some((r) => r.test(b.text))).map((b) => [b.stufe + b.art + b.text + b.wo, b])).values()];
    ergebnisse.push({ breite, hoehe, bild, befunde: eindeutig, statistik: { ...m.statistik, kontrastAnBildpunkten: px.gemessen } });
  }
  return { url, name, ergebnisse };
}

function bericht(seiten, o) {
  const z = ["# Design-Prüfung", "", `Profil: ${o.profil || "allgemein"} · Breiten: ${o.breiten.join(", ")} px · ${new Date().toISOString().slice(0, 16).replace("T", " ")} UTC`, ""];
  z.push("| Seite | Breite | Fehler | Warnungen | Bedienelemente | Screenshot |", "|---|---|---|---|---|---|");
  for (const s of seiten) for (const e of s.ergebnisse) {
    const f = e.befunde.filter((b) => b.stufe === "fehler").length, w = e.befunde.length - f;
    z.push(`| ${s.name} | ${e.breite} | ${f} | ${w} | ${e.statistik.bedienelemente} | ${relative(o.aus, e.bild)} |`);
  }
  for (const s of seiten) for (const e of s.ergebnisse) {
    if (!e.befunde.length) continue;
    z.push("", `## ${s.name} bei ${e.breite} px`, "");
    for (const b of e.befunde.sort((a, c) => (a.stufe === "fehler" ? 0 : 1) - (c.stufe === "fehler" ? 0 : 1))) z.push(`- ${b.stufe === "fehler" ? "**Fehler**" : "Warnung"} · ${b.art}: ${b.text}${b.wo ? ` · \`${b.wo}\`` : ""}`);
  }
  z.push("", "Nicht automatisch prüfbar, bitte selbst an den Screenshots ansehen: Hierarchie und Ruhe, Ausrichtung, einheitliche Ecken und Abstände je Ebene, Glas nur auf schwebenden Ebenen, Zustände (Hover, Fokus, gedrückt, leer, Fehler, Laden), Dunkel- und Hellmodus, reduzierte Bewegung.");
  return z.join("\n") + "\n";
}

export async function pruefen(o, speicher) {
  await mkdir(o.aus, { recursive: true });
  const srv = await server(o.wurzel, speicher, o.basis);
  const basis = `http://127.0.0.1:${srv.address().port}`;
  const browser = await chromium.launch();
  const seiten = [];
  try {
    for (const ziel of o.ziele) {
      const url = /^https?:/.test(ziel) ? ziel : speicher?.[ziel] !== undefined ? basis + ziel : `${basis}${o.basis || ""}/${relative(resolve(o.wurzel), resolve(ziel)).split("\\").join("/")}`;
      const name = (/^https?:/.test(ziel) ? new URL(ziel).pathname : ziel).replace(/\/$/, "/index").replace(/\.html?$/, "").split("/").filter(Boolean).slice(-2).join("-").replace(/[^\w-]/g, "") || basename(ziel) || "seite";
      seiten.push(await pruefeSeite(browser, url, name, o));
    }
  } finally { await browser.close(); srv.close(); }
  const md = bericht(seiten, o);
  await writeFile(join(o.aus, "bericht.md"), md);
  await writeFile(join(o.aus, "bericht.json"), JSON.stringify(seiten, null, 2));
  return { seiten, md };
}

const KOPF = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Probe</title>`;
const PROBEN = {
  "/gut.html": `${KOPF}<style>:root{--bg:#08080a;--text:#f5f5f7;--akzent:#64d2ff}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.5 -apple-system,system-ui,sans-serif}
header{position:sticky;top:0;padding:12px 16px;backdrop-filter:blur(20px);background:rgba(30,30,34,.6)}main{max-width:640px;margin:0 auto;padding:16px}
button{min-height:44px;min-width:44px;padding:10px 16px;border:0;border-radius:12px;background:var(--akzent);color:#00131c;font:600 16px system-ui}:focus-visible{outline:2px solid var(--akzent)}
ul{list-style:none;padding:0;margin:16px 0}li{padding:12px 16px;border-radius:14px;background:#161618;margin-bottom:8px}label{display:block;margin:8px 0}input{min-height:44px;width:100%;padding:8px 12px;border-radius:10px;border:1px solid #444;background:#161618;color:#fff;box-sizing:border-box}</style></head>
<body><header><h1>Heute</h1></header><main><ul><li>Training 18 Uhr</li><li>BWL lernen</li></ul><label>Notiz<input></label><button>Speichern</button></main></body></html>`,
  "/schlecht.html": `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no"><title>Probe</title><style>body{margin:0;background:#fff;color:#000;font:16px Georgia}
.breit{width:900px;height:20px}.grau{color:#bbb}.mini{width:20px;height:20px;padding:0;border:0;background:#0a84ff;color:#fff}.label{text-transform:uppercase;letter-spacing:.3em;font-size:12px}
.glow{box-shadow:0 0 24px rgba(0,255,200,.9);padding:8px}.schraeg{clip-path:polygon(0 0,100% 0,95% 100%,0 100%);background:#333;color:#fff;padding:8px}.decke{position:relative}.decke::after{content:"";position:absolute;inset:0}</style></head>
<body><div class="breit"></div><p class="grau">Kaum lesbar</p><button class="mini"></button><span class="label">Status</span><div class="glow">Leuchten</div><div class="schraeg">Ecke</div><button>Weiter →</button><button>🔥 Los</button><img src="fehlt.png"><input placeholder="Name"><div style="display:flex;gap:4px"><button style="width:48px;height:48px;white-space:nowrap;overflow:visible">Übermorgen</button><button style="width:48px;height:48px">Mi</button></div></body></html>`,
};

async function selbsttest() {
  const aus = join(process.env.TMPDIR || "/tmp", "design-pruefung-selbsttest");
  const { seiten } = await pruefen({ ziele: ["/gut.html", "/schlecht.html"], breiten: [390, 1440], profil: "nox", schema: "", aus, wurzel: ".", basis: "", warten: 50 }, PROBEN);
  const fehler = (s) => s.ergebnisse.flatMap((e) => e.befunde.filter((b) => b.stufe === "fehler"));
  const gut = fehler(seiten[0]), schlecht = fehler(seiten[1]);
  const erwartet = ["Überlauf", "Kontrast", "Trefferfläche", "Barrierefreiheit", "Apple-Look", "Kaputt"];
  const fehlt = erwartet.filter((a) => !schlecht.some((b) => b.art === a));
  const texte = schlecht.map((b) => b.text).join(" | ");
  const regeln = ["schräge Ecken", "farbiger Glow", "gesperrte Großbuchstaben", "Emoji", "Pfeil im Knopf", "Zoomen ist gesperrt", "lang> fehlt", "aus seinem Kasten"].filter((t) => !texte.includes(t));
  if (gut.length) console.error("Gute Probe hat Fehler:", gut);
  if (fehlt.length || regeln.length) console.error("Schlechte Probe, nicht erkannt:", fehlt, regeln);
  const ok = !gut.length && !fehlt.length && !regeln.length;
  console.log(ok ? `Selbsttest grün: gute Probe 0 Fehler, schlechte Probe ${schlecht.length} Fehler erkannt.` : "Selbsttest ROT");
  return ok;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("design-pruefung.mjs")) {
  const o = argumente(process.argv.slice(2));
  if (o.selbsttest) process.exit((await selbsttest()) ? 0 : 1);
  if (!o.ziele.length) { console.log(HILFE); process.exit(2); }
  const { seiten, md } = await pruefen(o);
  console.log(md);
  const fehler = seiten.flatMap((s) => s.ergebnisse.flatMap((e) => e.befunde)).filter((b) => b.stufe === "fehler").length;
  console.log(fehler ? `${fehler} Fehler. Screenshots und Bericht: ${o.aus}/` : `Keine Fehler. Screenshots und Bericht: ${o.aus}/`);
  process.exit(fehler && !o.nurBericht ? 1 : 0);
}
