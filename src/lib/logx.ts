/**
 * LogX-Anbindung über die TryNow-Schnittstelle von miha bodytec.
 *
 * Was sie kann: freie Probetraining-Zeiten aus dem LogX-Kalender eines
 * Studios abfragen und eine davon buchen. Mehr nicht - einen Termin wieder
 * löschen oder einen Interessenten ohne Termin anlegen geht damit nicht.
 *
 * Wie wir sie nutzen: Wählt jemand im Anfrageformular eine freie Zeit,
 * wird sie in LogX gebucht - mit dem Vermerk "NOCH UNBESTÄTIGT". Das
 * Studio ruft wie bisher an und gibt den Termin danach in LogX frei (oder
 * löscht ihn). Bei uns bleibt die Anfrage offen, bis das Studio im
 * Adminbereich bestätigt; erst dann geht die Terminbestätigung an den Gast.
 *
 * Grundsatz: Jede Störung hier - kein Zugang, Zeitüberschreitung,
 * Fehlermeldung - verhält sich so, als gäbe es LogX nicht. Dann zeigt das
 * Formular wie bisher die Wunschzeiten, und keine Anfrage geht verloren.
 *
 * Nur auf dem Server benutzen: Der Schlüssel darf nie in den Browser.
 */

/** Ohne Angabe die echte Schnittstelle; LOGX_API_BASIS nur für Tests. */
const BASIS = (process.env.LOGX_API_BASIS || "https://evertrag.miha-bodytec.com/api/v1/trial-training").replace(/\/$/, "");

/** Wie lange wir auf LogX warten, bevor wir es als Störung werten. */
const WARTEZEIT_MS = 6000;

export type LogxZugang = {
  hash: string;
  profil: number | null;
  schluessel: string;
};

/** Der Zugang eines Studios - oder null, wenn etwas fehlt. */
export function logxZugang(studio: {
  logxStudioHash: string | null;
  logxProfileId: number | null;
  logxApiKey: string | null;
}): LogxZugang | null {
  const hash = studio.logxStudioHash?.trim();
  const schluessel = studio.logxApiKey?.trim();
  if (!hash || !schluessel) return null;
  return { hash, profil: studio.logxProfileId ?? null, schluessel };
}

export type FreieZeit = {
  /** Undurchsichtiger Schlüssel aus LogX - wird beim Buchen zurückgegeben. */
  token: string;
  /** "09:00" */
  von: string;
  bis: string;
};

export type FreierTag = {
  /** "2026-11-10" */
  tag: string;
  zeiten: FreieZeit[];
};

function adresse(zugang: LogxZugang, rest: string, mitProfil = true) {
  const profil = mitProfil && zugang.profil ? `/${zugang.profil}` : "";
  return `${BASIS}/${encodeURIComponent(zugang.hash)}${profil}${rest}`;
}

type Antwort = { status: number; daten: unknown };

async function abrufen(
  zugang: LogxZugang,
  url: string,
  optionen: { methode?: "GET" | "POST"; koerper?: unknown; zwischenspeichern?: number } = {},
): Promise<Antwort | null> {
  try {
    const antwort = await fetch(url, {
      method: optionen.methode ?? "GET",
      headers: {
        Authorization: `Bearer ${zugang.schluessel}`,
        Accept: "application/json",
        ...(optionen.koerper ? { "Content-Type": "application/json" } : {}),
      },
      body: optionen.koerper ? JSON.stringify(optionen.koerper) : undefined,
      signal: AbortSignal.timeout(WARTEZEIT_MS),
      // Freie Zeiten eine Minute zwischenspeichern: Die Schnittstelle hat
      // eine Begrenzung der Abfragen, und vierzehn Besucher in derselben
      // Minute brauchen keine vierzehn Abfragen. Buchen nie.
      ...(optionen.zwischenspeichern
        ? { next: { revalidate: optionen.zwischenspeichern } }
        : { cache: "no-store" as const }),
    });
    const text = await antwort.text();
    let daten: unknown = null;
    try {
      daten = text ? JSON.parse(text) : null;
    } catch {
      daten = text;
    }
    return { status: antwort.status, daten };
  } catch {
    return null;
  }
}

function heute(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
}

function tagDanach(tag: string): string {
  const [j, m, t] = tag.split("-").map(Number);
  const d = new Date(Date.UTC(j, m - 1, t + 1));
  return d.toISOString().slice(0, 10);
}

const IST_TAG = /^\d{4}-\d{2}-\d{2}$/;
const IST_ZEIT = /^\d{2}:\d{2}$/;

/**
 * Die nächsten Tage mit freien Zeiten - höchstens `tage` Tage, gesucht
 * bis `suchbereich` Tage voraus. Leer, wenn es keine gibt oder LogX
 * nicht erreichbar ist.
 *
 * Erst "nächster freier Tag", dann die Zeiten dieses Tages: So kostet
 * eine Woche ohne Termine eine Abfrage statt sieben.
 */
export async function freieZeiten(
  zugang: LogxZugang,
  { tage = 5, suchbereich = 21 }: { tage?: number; suchbereich?: number } = {},
): Promise<FreierTag[]> {
  const ergebnis: FreierTag[] = [];
  const grenze = new Date(Date.now() + suchbereich * 86400000).toISOString().slice(0, 10);
  let ab = heute();

  // Obergrenze für Abfragen, egal was LogX antwortet.
  for (let runde = 0; runde < tage * 2 && ergebnis.length < tage; runde++) {
    const naechster = await abrufen(zugang, adresse(zugang, `/next-available?from=${ab}`), { zwischenspeichern: 60 });
    const n = naechster?.status === 200 ? (naechster.daten as { found?: boolean; date?: string | null }) : null;
    if (!n?.found || !n.date || !IST_TAG.test(n.date) || n.date > grenze) break;

    const tagesZeiten = await abrufen(zugang, adresse(zugang, `/available-slots?date=${n.date}`), { zwischenspeichern: 60 });
    const z =
      tagesZeiten?.status === 200
        ? (tagesZeiten.daten as { slots?: { slotToken?: string; timeFrom?: string; timeTo?: string }[] })
        : null;
    const zeiten = (z?.slots ?? [])
      .filter((s) => typeof s.slotToken === "string" && s.slotToken && IST_ZEIT.test(s.timeFrom ?? "") && IST_ZEIT.test(s.timeTo ?? ""))
      .map((s) => ({ token: s.slotToken as string, von: s.timeFrom as string, bis: s.timeTo as string }));
    if (zeiten.length) ergebnis.push({ tag: n.date, zeiten });

    // Liefert LogX denselben Tag erneut oder einen früheren, nicht endlos
    // weiterfragen.
    if (n.date < ab) break;
    ab = tagDanach(n.date);
  }
  return ergebnis;
}

export type BuchungsDaten = {
  token: string;
  vorname: string;
  nachname: string;
  geschlecht: "male" | "female" | "diverse";
  telefon: string;
  email: string;
  bemerkung: string;
  einwilligung: boolean;
};

export type BuchungsErgebnis =
  | { ok: true; terminNr: number | null; tag: string; von: string; bis: string }
  | { ok: false; grund: "belegt" | "fehler" };

/** Bucht eine freie Zeit in LogX. Wird nur beim Absenden aufgerufen. */
export async function buchen(zugang: LogxZugang, daten: BuchungsDaten): Promise<BuchungsErgebnis> {
  const antwort = await abrufen(zugang, adresse(zugang, "/book"), {
    methode: "POST",
    koerper: {
      slotToken: daten.token,
      firstName: daten.vorname.slice(0, 100),
      lastName: daten.nachname.slice(0, 100),
      gender: daten.geschlecht,
      phone: daten.telefon.slice(0, 50),
      email: daten.email.slice(0, 255),
      remarks: daten.bemerkung.slice(0, 2000),
      consentToDataStorage: daten.einwilligung,
    },
  });
  if (!antwort) return { ok: false, grund: "fehler" };
  if (antwort.status === 409) return { ok: false, grund: "belegt" };
  const d = antwort.daten as {
    success?: boolean;
    appointmentId?: number | null;
    date?: string | null;
    timeFrom?: string | null;
    timeTo?: string | null;
  } | null;
  if ((antwort.status === 200 || antwort.status === 201) && d?.success && d.date && d.timeFrom) {
    return {
      ok: true,
      terminNr: typeof d.appointmentId === "number" ? d.appointmentId : null,
      tag: d.date,
      von: d.timeFrom,
      bis: d.timeTo ?? "",
    };
  }
  return { ok: false, grund: "fehler" };
}

/**
 * Für den Knopf "Verbindung testen" im Adminbereich: prüft Schlüssel,
 * Profil und Terminart und sagt in einfachen Worten, was fehlt.
 */
export async function verbindungTesten(zugang: LogxZugang): Promise<{ ok: boolean; zeilen: string[] }> {
  const zeilen: string[] = [];

  const status = await abrufen(zugang, adresse(zugang, "", false));
  if (!status) return { ok: false, zeilen: ["LogX ist nicht erreichbar. Später noch einmal versuchen."] };
  if (status.status === 401 || status.status === 403)
    return { ok: false, zeilen: ["Der API-Schlüssel wird nicht angenommen."] };
  if (status.status === 404)
    return { ok: false, zeilen: ["Die Studio-Kennung (Hash) ist LogX nicht bekannt."] };
  if (status.status !== 200) return { ok: false, zeilen: [`LogX antwortet mit Fehler ${status.status}.`] };
  zeilen.push("Schlüssel und Studio-Kennung passen.");

  const profile = await abrufen(zugang, adresse(zugang, "/profiles", false));
  const liste = Array.isArray(profile?.daten)
    ? (profile.daten as { id: number; name: string; enabled: boolean; appointmentTypeName: string | null }[])
    : [];
  if (!liste.length) {
    zeilen.push("In LogX ist noch kein TryNow-Profil angelegt.");
    return { ok: false, zeilen };
  }
  for (const p of liste) {
    zeilen.push(
      `Profil ${p.id} „${p.name}“: ${p.enabled ? "eingeschaltet" : "AUSGESCHALTET"}${
        p.appointmentTypeName ? `, Terminart „${p.appointmentTypeName}“` : ", KEINE Terminart gewählt"
      }`,
    );
  }
  const gewaehlt = zugang.profil ? liste.find((p) => p.id === zugang.profil) : null;
  if (zugang.profil && !gewaehlt) {
    zeilen.push(`Die eingetragene Profil-Nummer ${zugang.profil} gibt es in LogX nicht.`);
    return { ok: false, zeilen };
  }
  const aktiv = gewaehlt ? gewaehlt.enabled : liste.some((p) => p.enabled);
  if (!aktiv) {
    zeilen.push("Das Profil ist ausgeschaltet - in LogX unter TryNow Konfiguration „Profil aktiv“ einschalten.");
    return { ok: false, zeilen };
  }

  const arten = await abrufen(zugang, adresse(zugang, "/appointment-types"));
  const artenListe = (arten?.daten as { data?: { name: string; length: number }[] } | null)?.data ?? [];
  if (!artenListe.length) {
    zeilen.push("Keine Terminart für Probetrainings - in LogX bei der Terminart „Dieser Termin ist ein Probetraining“ anhaken und im Profil auswählen.");
    return { ok: false, zeilen };
  }
  zeilen.push(`Terminart: ${artenListe.map((a) => `${a.name} (${a.length} Min.)`).join(", ")}`);

  const tage = await freieZeiten(zugang, { tage: 1 });
  zeilen.push(
    tage.length
      ? `Nächste freie Zeit: ${tage[0].tag} um ${tage[0].zeiten[0].von} Uhr.`
      : "Zurzeit keine freien Zeiten - Freigabezeiten bzw. Kalender in LogX prüfen.",
  );
  return { ok: tage.length > 0, zeilen };
}
