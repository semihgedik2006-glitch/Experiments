import { resolveMx } from "node:dns/promises";
import { prisma } from "@/lib/prisma";
import { TEAM_EMAIL, versandAbsender, versandBereit, versandNurTestadresse } from "@/lib/email";
import { VORGESEHENE_ADRESSE, basisadresseErmitteln } from "@/lib/basisadresse";

/**
 * Ist die Website startklar?
 *
 * Die offenen Punkte vor dem Start lagen bisher auf fünf Seiten verteilt
 * (E-Mail-Versand, Studios, Adresse, Kundenstimmen, Trainer) - und in einer
 * PDF. Wer wissen wollte, was noch fehlt, musste fragen. Hier steht alles
 * auf einer Seite, jeweils mit dem Weg dorthin, wo man es erledigt.
 *
 * Jeder Punkt wird nachgesehen, nicht angenommen: Ein grüner Haken heißt,
 * die Website hat es eben selbst geprüft. Was sie nicht prüfen kann
 * (Rechtstexte), steht als "selbst prüfen" da - nie als erledigt.
 */

export type Stand = "ok" | "offen" | "selbst";

export type Punkt = {
  id: string;
  titel: string;
  stand: Stand;
  /** Eine Zeile: was gerade ist, oder was fehlt und was es kostet. */
  text: string;
  /** Was zu tun ist - nur bei offenen Punkten. */
  tun?: string;
  link?: { href: string; label: string };
};

export type Startklar = { pflicht: Punkt[]; empfohlen: Punkt[] };

/**
 * Nimmt die Domain einer Adresse überhaupt E-Mails an?
 *
 * Der Anlass: Wochenlang stand info@koerperformen.com auf der Seite und
 * beim Studio Hürth - eine Domain, die nicht Körperformen gehört und jede
 * Mail abweist (MX "0 ."). Von innen sah die Adresse völlig normal aus.
 * Ein Blick auf den MX-Eintrag zeigt so etwas sofort.
 *
 * "unklar" statt "nein", wenn die Abfrage selbst scheitert: Ein
 * Netzwerkproblem soll keinen roten Punkt erzeugen.
 */
async function nimmtMailAn(domain: string): Promise<"ja" | "nein" | "unklar"> {
  try {
    const eintraege = await Promise.race([
      resolveMx(domain),
      new Promise<never>((_, nein) => setTimeout(() => nein(new Error("Zeitüberschreitung")), 3000)),
    ]);
    // Null-MX (RFC 7505): ein einziger Eintrag mit leerem Ziel heißt
    // ausdrücklich "hier gibt es keine Post".
    const echte = eintraege.filter((e) => e.exchange && e.exchange !== ".");
    return echte.length > 0 ? "ja" : "nein";
  } catch (error) {
    const code = (error as { code?: string }).code;
    // Domain gibt es nicht, oder sie hat keinen MX-Eintrag.
    if (code === "ENOTFOUND" || code === "ENODATA") return "nein";
    return "unklar";
  }
}

function domainVon(adresse: string): string | null {
  const treffer = /@([^\s@>]+)>?\s*$/.exec(adresse.trim());
  return treffer ? treffer[1].toLowerCase() : null;
}

/**
 * Zeigt die Domain schon auf diese Website?
 *
 * Statt die DNS-Einträge mit Vercels Werten zu vergleichen (die Vercel
 * ändern kann), wird die Seite einfach aufgerufen: Liefert die Domain
 * unsere robots.txt aus, ist es unsere Website. Die alte Seite beim
 * Webhoster hat keine Zeile "Disallow: /meine-termine/".
 */
async function domainZeigtHierher(): Promise<"ja" | "nein" | "unklar"> {
  try {
    const antwort = await fetch(`${VORGESEHENE_ADRESSE}/robots.txt`, {
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(4000),
    });
    if (!antwort.ok) return "nein";
    const text = await antwort.text();
    return text.includes("/meine-termine/") ? "ja" : "nein";
  } catch (error) {
    // Ein Zertifikatsfehler heißt fast immer: Die Domain zeigt noch auf
    // einen anderen Server, der für sie kein gültiges Zertifikat hat.
    const ursache = (error as { cause?: { code?: string } }).cause?.code ?? "";
    if (ursache.startsWith("ERR_TLS") || ursache.includes("CERT") || ursache === "ENOTFOUND") {
      return "nein";
    }
    return "unklar";
  }
}

export async function startklarPruefen(): Promise<Startklar> {
  const [studios, trainer, stimmen, domain] = await Promise.all([
    prisma.studioLocation.findMany({
      select: { name: true, email: true, googleReviewUrl: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.trainer.findMany({ where: { aktiv: true }, select: { fotoUrl: true } }),
    prisma.kundenstimme.count({ where: { aktiv: true } }),
    domainZeigtHierher(),
  ]);

  // Jede Domain nur einmal nachsehen - vierzehn Studios teilen sich meist eine.
  const domains = new Set<string>();
  for (const s of studios) {
    const d = s.email?.trim() ? domainVon(s.email) : null;
    if (d) domains.add(d);
  }
  const team = TEAM_EMAIL ? domainVon(TEAM_EMAIL) : null;
  if (team) domains.add(team);
  const mx = new Map<string, "ja" | "nein" | "unklar">();
  await Promise.all([...domains].map(async (d) => mx.set(d, await nimmtMailAn(d))));
  const tot = (adresse: string | null | undefined) => {
    const d = adresse?.trim() ? domainVon(adresse) : null;
    return d ? mx.get(d) === "nein" : false;
  };

  const pflicht: Punkt[] = [];
  const empfohlen: Punkt[] = [];

  // 1. E-Mail-Versand
  if (!versandBereit()) {
    pflicht.push({
      id: "versand",
      titel: "E-Mail-Versand",
      stand: "offen",
      text: "Die Website verschickt keine einzige E-Mail - keine Bestätigung, keine Erinnerung, keine Nachricht ans Studio.",
      tun: "Konto bei resend.com anlegen, kformen.com dort bestätigen, dann RESEND_API_KEY und BOOKING_EMAIL_FROM in Vercel eintragen.",
      link: { href: "/admin/mails", label: "Zum E-Mail-Versand" },
    });
  } else if (versandNurTestadresse()) {
    pflicht.push({
      id: "versand",
      titel: "E-Mail-Versand",
      stand: "offen",
      text: "Der Schlüssel ist da, aber es fehlt der Absender. Über Resends Testadresse kommt bei Kunden nichts an.",
      tun: "In Vercel BOOKING_EMAIL_FROM eintragen, z. B. Körperformen <huerth@kformen.com>.",
      link: { href: "/admin/mails", label: "Zum E-Mail-Versand" },
    });
  } else {
    pflicht.push({
      id: "versand",
      titel: "E-Mail-Versand",
      stand: "ok",
      text: `Eingerichtet. Absender: ${versandAbsender()}`,
      link: { href: "/admin/mails", label: "Versandprotokoll ansehen" },
    });
  }

  // 2. Sammeladresse
  if (!TEAM_EMAIL) {
    pflicht.push({
      id: "team",
      titel: "Sammeladresse (TEAM_EMAIL)",
      stand: "offen",
      text: "Kontaktnachrichten und Anfragen von Studios ohne eigene Adresse gehen an niemanden.",
      tun: "In Vercel unter Environment Variables TEAM_EMAIL eintragen, dann neu veröffentlichen.",
    });
  } else if (tot(TEAM_EMAIL)) {
    pflicht.push({
      id: "team",
      titel: "Sammeladresse (TEAM_EMAIL)",
      stand: "offen",
      text: `${TEAM_EMAIL} nimmt keine E-Mails an - die Domain hat keinen Posteingang.`,
      tun: "In Vercel eine Adresse eintragen, die wirklich gelesen wird.",
    });
  } else {
    pflicht.push({ id: "team", titel: "Sammeladresse (TEAM_EMAIL)", stand: "ok", text: TEAM_EMAIL });
  }

  // 3. Adressen der Studios
  const ohne = studios.filter((s) => !s.email?.trim());
  const tote = studios.filter((s) => s.email?.trim() && tot(s.email));
  if (ohne.length === 0 && tote.length === 0) {
    pflicht.push({
      id: "studios",
      titel: "E-Mail-Adresse je Studio",
      stand: "ok",
      text:
        studios.length === 1
          ? "Das Studio hat eine Adresse, die E-Mails annimmt."
          : `Alle ${studios.length} Studios haben eine Adresse, die E-Mails annimmt.`,
      link: { href: "/admin/studios", label: "Zu den Studios" },
    });
  } else {
    const teile: string[] = [];
    if (ohne.length) {
      teile.push(
        `${ohne.length} von ${studios.length} Studios ohne eigene Adresse: ${ohne.map((s) => s.name).join(", ")}.`,
      );
    }
    if (tote.length) {
      teile.push(
        `Nimmt keine E-Mails an: ${tote.map((s) => `${s.name} (${s.email})`).join(", ")}.`,
      );
    }
    pflicht.push({
      id: "studios",
      titel: "E-Mail-Adresse je Studio",
      stand: "offen",
      text: teile.join(" "),
      tun: "Anfragen für diese Studios landen nicht beim Studio. In der Studioverwaltung je Standort eine Adresse eintragen, in die dort jemand schaut.",
      link: { href: "/admin/studios", label: "Zu den Studios" },
    });
  }

  // 4. Domain
  const host = VORGESEHENE_ADRESSE.replace("https://", "");
  pflicht.push(
    domain === "ja"
      ? {
          id: "domain",
          titel: "Eigene Domain",
          stand: "ok",
          text: `${host} zeigt auf diese Website.`,
          link: { href: "/admin/adresse", label: "Adresse & Auffindbarkeit" },
        }
      : {
          id: "domain",
          titel: "Eigene Domain",
          stand: "offen",
          text:
            domain === "nein"
              ? `${host} zeigt noch nicht auf diese Website.`
              : `${host} war gerade nicht zu erreichen - später noch einmal ansehen.`,
          tun: "Beim Domainanbieter (Greatnet) die Einträge setzen lassen, die Vercel unter Settings › Domains anzeigt.",
          link: { href: "/admin/adresse", label: "Adresse & Auffindbarkeit" },
        },
  );

  // 5. Sicherheit: Sitzungsschlüssel
  const geheim = process.env.AUTH_SECRET ?? "";
  pflicht.push(
    geheim.length >= 32 && geheim !== "changeme"
      ? { id: "auth", titel: "Schlüssel für Admin-Anmeldungen", stand: "ok", text: "Lang genug und nicht der Platzhalter." }
      : {
          id: "auth",
          titel: "Schlüssel für Admin-Anmeldungen",
          stand: "offen",
          text: "AUTH_SECRET ist zu kurz oder noch der Platzhalter. Damit lassen sich Anmeldungen fälschen.",
          tun: "In Vercel einen zufälligen Wert mit mindestens 32 Zeichen eintragen. Danach muss sich jeder neu anmelden.",
        },
  );

  // 6. Sicherheit: automatische Abläufe
  pflicht.push(
    process.env.CRON_SECRET?.trim()
      ? { id: "cron", titel: "Schutz der automatischen Abläufe", stand: "ok", text: "CRON_SECRET ist gesetzt." }
      : {
          id: "cron",
          titel: "Schutz der automatischen Abläufe",
          stand: "offen",
          text: "Ohne CRON_SECRET kann jeder, der die Adresse kennt, Erinnerungen und Nachfass-Mails auslösen.",
          tun: "In Vercel CRON_SECRET mit einem zufälligen Wert anlegen. Vercel schickt ihn bei den eigenen Abläufen automatisch mit.",
        },
  );

  // 7. Rechtstexte - kann die Website nicht selbst prüfen.
  pflicht.push({
    id: "recht",
    titel: "Impressum und Datenschutzerklärung",
    stand: "selbst",
    text: "Kann die Website nicht selbst prüfen. Vor dem Start von einem Anwalt oder Datenschutzberater ansehen lassen - vor allem wegen Buchungsformular, Newsletter und Analyse.",
    link: { href: "/datenschutz", label: "Datenschutzerklärung öffnen" },
  });

  // Empfohlen
  const basis = basisadresseErmitteln();
  empfohlen.push(
    basis.herkunft === "eingetragen" && basis.url === VORGESEHENE_ADRESSE
      ? { id: "basis", titel: "Adresse für Google eingetragen", stand: "ok", text: basis.url }
      : {
          id: "basis",
          titel: "Adresse für Google eingetragen",
          stand: "offen",
          text: `Die Website nimmt ${VORGESEHENE_ADRESSE} von selbst an. Fest eingetragen ist sie noch nicht.`,
          tun: "Sobald die Domain läuft: in Vercel NEXT_PUBLIC_SITE_URL = " + VORGESEHENE_ADRESSE + " eintragen und neu veröffentlichen.",
          link: { href: "/admin/adresse", label: "Adresse & Auffindbarkeit" },
        },
  );

  empfohlen.push(
    stimmen > 0
      ? { id: "stimmen", titel: "Kundenstimmen", stand: "ok", text: `${stimmen} freigegeben.` }
      : {
          id: "stimmen",
          titel: "Kundenstimmen",
          stand: "offen",
          text: "Noch keine freigegeben - die Erfolgsseite bleibt so lange ausgeblendet.",
          tun: "Drei bis fünf Mitglieder um ein paar Sätze bitten, Einverständnis aufheben, unter Kundenstimmen eintragen.",
          link: { href: "/admin/kundenstimmen", label: "Zu den Kundenstimmen" },
        },
  );

  const mitFoto = trainer.filter((t) => t.fotoUrl?.trim()).length;
  empfohlen.push(
    trainer.length > 0 && mitFoto === trainer.length
      ? { id: "trainer", titel: "Trainer mit Foto", stand: "ok", text: trainer.length === 1 ? "Mit Foto." : `Alle ${trainer.length} mit Foto.` }
      : {
          id: "trainer",
          titel: "Trainer mit Foto",
          stand: "offen",
          text:
            trainer.length === 0
              ? "Noch kein Trainer eingetragen. Auf den Standortseiten fehlt damit das Gesicht vor Ort."
              : `${mitFoto} von ${trainer.length} Trainern mit Foto.`,
          tun: "Unter Trainer Fotos hochladen - echte, keine Bilder aus dem Netz.",
          link: { href: "/admin/trainer", label: "Zu den Trainern" },
        },
  );

  const ohneBewertung = studios.filter((s) => !s.googleReviewUrl?.trim());
  empfohlen.push(
    ohneBewertung.length === 0
      ? { id: "bewertung", titel: "Google-Bewertungslink je Studio", stand: "ok", text: "Bei allen Studios hinterlegt." }
      : {
          id: "bewertung",
          titel: "Google-Bewertungslink je Studio",
          stand: "offen",
          text: `${ohneBewertung.length} von ${studios.length} Studios ohne Link - dort geht nach dem Probetraining keine Bitte um eine Bewertung raus.`,
          tun: "Im Google-Unternehmensprofil den Link „Rezensionen erhalten“ kopieren und beim Studio eintragen.",
          link: { href: "/admin/studios", label: "Zu den Studios" },
        },
  );

  return { pflicht, empfohlen };
}

/**
 * Die schnelle Fassung für die Übersicht: nur was ohne Netz geht.
 *
 * Domain und Postfächer werden hier bewusst nicht abgefragt - das kann
 * Sekunden dauern, und die Übersicht öffnet jeder mehrmals am Tag. Sie
 * soll nur sagen, DASS noch etwas fehlt; was genau, steht auf der Seite.
 */
export async function startklarOffen(): Promise<number> {
  const ohneAdresse = await prisma.studioLocation.count({ where: { email: "" } });
  const geheim = process.env.AUTH_SECRET ?? "";
  return [
    !versandBereit() || versandNurTestadresse(),
    !TEAM_EMAIL,
    ohneAdresse > 0,
    geheim.length < 32 || geheim === "changeme",
    !process.env.CRON_SECRET?.trim(),
  ].filter(Boolean).length;
}
