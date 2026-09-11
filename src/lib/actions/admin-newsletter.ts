"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verlangeLeitungAktion } from "@/lib/admin-rechte";
import { sendNewsletterEmail, versandBereit } from "@/lib/email";
import {
  abmeldeLink,
  entwurfPruefen,
  neuerAbmeldeSchluessel,
  newsletterText,
} from "@/lib/newsletter";
import type { ActionResult } from "@/lib/actions/newsletter";
import { protokollieren } from "@/lib/protokoll";

/**
 * Newsletter schreiben und verschicken.
 *
 * Der Versand läuft in ABSCHNITTEN und nicht in einem Rutsch. Grund: Eine
 * Serveraktion hat eine Laufzeitgrenze, und der Mailanbieter nimmt nur
 * wenige Nachrichten pro Sekunde an. Zweihundert Adressen am Stück wären
 * zweihundert Sekunden - die Aktion würde mittendrin abgebrochen, und
 * niemand wüsste, wer schon dran war.
 *
 * Stattdessen: Jeder Lauf nimmt sich die nächsten VERSAND_PRO_LAUF
 * Adressen, hält jede einzelne in NewsletterEmpfang fest und meldet
 * zurück, ob noch etwas übrig ist. Ist noch etwas übrig, bleibt die
 * Ausgabe auf LAEUFT stehen, und im Adminbereich erscheint "Versand
 * fortsetzen".
 *
 * Bei einer Liste in der Größenordnung Zehntausend gehörte das in eine
 * richtige Warteschlange. Für eine Studiokette mit ein paar hundert
 * Abonnenten ist ein Knopf, den man notfalls zweimal drückt, die ehrlichere
 * Lösung als eine Warteschlange, die niemand wartet.
 */
const VERSAND_PRO_LAUF = 60;

/**
 * Pause zwischen zwei Nachrichten.
 *
 * Resend nimmt im Basistarif zwei Anfragen je Sekunde an. Ohne Pause
 * liefen die letzten Nachrichten eines Abschnitts in eine Abweisung -
 * und die sähe im Protokoll aus wie eine unzustellbare Adresse.
 */
const PAUSE_MS = 550;

const warte = (ms: number) => new Promise((fertig) => setTimeout(fertig, ms));

function felder(formData: FormData) {
  return {
    betreff: String(formData.get("betreff") ?? "").trim(),
    text: String(formData.get("text") ?? "").trim(),
  };
}

/**
 * Entwurf anlegen oder ändern.
 *
 * Eine bereits versendete Ausgabe lässt sich nicht mehr bearbeiten. Sie
 * liegt in fremden Postfächern; sie hier zu ändern würde nur die eigene
 * Aufzeichnung verfälschen.
 */
export async function newsletterSpeichern(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await verlangeLeitungAktion();

  const { betreff, text } = felder(formData);
  const fehler = entwurfPruefen({ betreff, text });
  if (fehler) return { ok: false, message: fehler };

  const id = String(formData.get("id") ?? "").trim();

  if (id) {
    const vorhanden = await prisma.newsletter.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!vorhanden) return { ok: false, message: "Diese Ausgabe gibt es nicht mehr." };
    if (vorhanden.status !== "ENTWURF") {
      return {
        ok: false,
        message: "Diese Ausgabe ist schon raus und lässt sich nicht mehr ändern.",
      };
    }

    await prisma.newsletter.update({ where: { id }, data: { betreff, text } });
    revalidatePath("/admin/newsletter");
    revalidatePath(`/admin/newsletter/${id}`);
    return { ok: true, message: "Entwurf gespeichert." };
  }

  const neu = await prisma.newsletter.create({ data: { betreff, text } });
  revalidatePath("/admin/newsletter");
  // Weiter zur Ausgabe: Nach dem Anlegen will man den Testversand, nicht
  // ein leeres Formular für die nächste Ausgabe.
  redirect(`/admin/newsletter/${neu.id}`);
}

export async function newsletterLoeschen(id: string) {
  await verlangeLeitungAktion();

  const vorhanden = await prisma.newsletter.findUnique({
    where: { id },
    select: { status: true },
  });
  // Eine versendete Ausgabe bleibt stehen. Was raus ist, ist raus - die
  // Aufzeichnung darüber zu löschen, ändert daran nichts.
  if (!vorhanden || vorhanden.status !== "ENTWURF") {
    throw new Error("Nur Entwürfe lassen sich löschen.");
  }

  await prisma.newsletter.delete({ where: { id } });
  revalidatePath("/admin/newsletter");
  redirect("/admin/newsletter");
}

/**
 * Probeversand an die eigene Adresse.
 *
 * Geht ausdrücklich an die Adresse des angemeldeten Zugangs und nicht an
 * eine, die im Formular steht: Ein Eingabefeld für den Empfänger wäre ein
 * Weg, eine Ausgabe an eine beliebige Adresse zu schicken, ohne dass es
 * jemand als Versand erkennt.
 *
 * Der Abmeldelink zeigt auf einen erfundenen Schlüssel - der Testversand
 * soll niemanden abmelden können, muss aber zeigen, wie der Fuß aussieht.
 */
export async function newsletterTestVersand(id: string): Promise<ActionResult> {
  const admin = await verlangeLeitungAktion();

  if (!versandBereit()) {
    return {
      ok: false,
      message:
        "Es ist kein Mailanbieter hinterlegt - der Testversand wäre ins Leere gegangen. " +
        "Siehe E-Mail-Versand.",
    };
  }

  const ausgabe = await prisma.newsletter.findUnique({ where: { id } });
  if (!ausgabe) return { ok: false, message: "Diese Ausgabe gibt es nicht mehr." };

  // Ein Schlüssel für beide Stellen, nicht zwei: Im Fuß und in der
  // Kopfzeile muss derselbe Link stehen, sonst prüft man beim Probelesen
  // etwas anderes, als der Abmelden-Knopf des Postfachs aufruft.
  const erfunden = neuerAbmeldeSchluessel();

  const ok = await sendNewsletterEmail({
    empfaenger: admin.email,
    betreff: ausgabe.betreff,
    text: newsletterText(ausgabe.text, erfunden),
    abmeldeAdresse: abmeldeLink(erfunden),
    test: true,
  });

  revalidatePath("/admin/mails");

  return ok
    ? { ok: true, message: `Probeversand ging an ${admin.email}.` }
    : {
        ok: false,
        message: "Der Probeversand ist gescheitert. Die Meldung steht unter E-Mail-Versand.",
      };
}

/**
 * Die Ausgabe an alle Abonnenten schicken - oder einen begonnenen Versand
 * fortsetzen.
 *
 * Was hier absichtlich NICHT passiert: eine zweite Rückfrage. Die steht
 * bereits an der Schaltfläche, mitsamt der Zahl der Empfänger. Eine
 * Sicherheitsabfrage, die man zweimal wegklickt, klickt man beim dritten
 * Mal auch weg.
 */
export async function newsletterVersenden(id: string): Promise<ActionResult> {
  const admin = await verlangeLeitungAktion();

  if (!versandBereit()) {
    return {
      ok: false,
      message:
        "Es ist kein Mailanbieter hinterlegt - es wäre nichts angekommen. Siehe E-Mail-Versand.",
    };
  }

  const ausgabe = await prisma.newsletter.findUnique({ where: { id } });
  if (!ausgabe) return { ok: false, message: "Diese Ausgabe gibt es nicht mehr." };
  if (ausgabe.status === "VERSENDET") {
    return { ok: false, message: "Diese Ausgabe ist bereits vollständig raus." };
  }

  const fehler = entwurfPruefen(ausgabe);
  if (fehler) return { ok: false, message: fehler };

  const offen = await offeneEmpfaenger(id, 1);
  if (offen.length === 0) {
    await abschliessen(id, admin.email);
    return { ok: false, message: "Es gibt niemanden, an den die Ausgabe noch gehen könnte." };
  }

  // Der Zustand wird VOR dem Versand gesetzt, nicht danach: Sonst sähe die
  // Ausgabe während der ganzen Laufzeit wie ein Entwurf aus, und ein
  // zweiter Klick würde sie ein zweites Mal losschicken.
  await prisma.newsletter.update({
    where: { id },
    data: { status: "LAEUFT", versendetVon: admin.email },
  });
  revalidatePath("/admin/newsletter");
  revalidatePath(`/admin/newsletter/${id}`);

  // Der eigentliche Versand läuft nach der Antwort weiter. Die Seite
  // aktualisiert sich also sofort und zeigt "läuft", statt eine Minute
  // lang auf einen Ladebalken zu starren.
  after(async () => {
    await abschnittVersenden(id, admin.email);
  });

  await protokollieren({
    art: "VERSENDET",
    bereich: "Newsletter",
    betreff: ausgabe.betreff,
    detail: `Versand gestartet, ${offen.length > 0 ? "offene Adressen werden abgearbeitet" : ""}`.trim(),
  });

  return {
    ok: true,
    message: "Der Versand läuft. Lade die Seite gleich neu, dann siehst du den Stand.",
  };
}

/** Die Abonnenten, die diese Ausgabe noch nicht bekommen haben. */
async function offeneEmpfaenger(newsletterId: string, wieViele: number) {
  const erledigt = await prisma.newsletterEmpfang.findMany({
    where: { newsletterId },
    select: { empfaenger: true },
  });

  return prisma.newsletterSubscriber.findMany({
    where: { email: { notIn: erledigt.map((e) => e.empfaenger) } },
    // Nach Kennung sortiert, nicht nach Datum: Die Reihenfolge muss
    // zwischen zwei Abschnitten dieselbe bleiben.
    orderBy: { id: "asc" },
    take: wieViele,
  });
}

async function abschliessen(id: string, email: string) {
  await prisma.newsletter.update({
    where: { id },
    data: { status: "VERSENDET", versendetAm: new Date(), versendetVon: email },
  });
  revalidatePath("/admin/newsletter");
  revalidatePath(`/admin/newsletter/${id}`);
}

/**
 * Ein Abschnitt: bis zu VERSAND_PRO_LAUF Nachrichten.
 *
 * Wirft nicht. Läuft eine einzelne Adresse in einen Fehler, wird das
 * festgehalten und die nächste drangenommen - ein volles Postfach darf
 * nicht den ganzen Versand anhalten.
 */
async function abschnittVersenden(newsletterId: string, email: string) {
  try {
    const ausgabe = await prisma.newsletter.findUnique({ where: { id: newsletterId } });
    if (!ausgabe) return;

    const empfaenger = await offeneEmpfaenger(newsletterId, VERSAND_PRO_LAUF);

    for (const [i, abonnent] of empfaenger.entries()) {
      if (i > 0) await warte(PAUSE_MS);

      const ok = await sendNewsletterEmail({
        empfaenger: abonnent.email,
        betreff: ausgabe.betreff,
        text: newsletterText(ausgabe.text, abonnent.abmeldeToken),
        abmeldeAdresse: abmeldeLink(abonnent.abmeldeToken),
      });

      // Erst festhalten, dann weiterzählen. Bricht der Lauf hier ab, ist
      // schlimmstenfalls eine Zahl zu niedrig - schlimmer wäre eine
      // Adresse, die als erledigt gilt, ohne dass etwas ankam.
      await prisma.newsletterEmpfang.create({
        data: { newsletterId, empfaenger: abonnent.email, ok },
      });
      await prisma.newsletter.update({
        where: { id: newsletterId },
        data: ok ? { zugestellt: { increment: 1 } } : { gescheitert: { increment: 1 } },
      });
    }

    const nochOffen = await offeneEmpfaenger(newsletterId, 1);
    if (nochOffen.length === 0) await abschliessen(newsletterId, email);
    else {
      revalidatePath("/admin/newsletter");
      revalidatePath(`/admin/newsletter/${newsletterId}`);
    }
  } catch (error) {
    // Der Versand bleibt auf LAEUFT stehen. Das ist gewollt: Im
    // Adminbereich steht dann "fortsetzen", und niemand hält eine halb
    // verschickte Ausgabe für vollständig raus.
    console.error("Newsletter-Versand abgebrochen:", error);
  }
}
