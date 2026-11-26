import type { Metadata } from "next";
import { verlangeAdmin } from "@/lib/admin-rechte";
import { DruckKnopf } from "@/components/admin/druck-knopf";
import { legalConfig } from "@/lib/legal-config";

export const metadata: Metadata = {
  title: "Einwilligung Werbung",
  robots: { index: false, follow: false },
};

/**
 * Ein Zettel für die Einwilligung in Werbung - für Mitglieder, die schon
 * einen Vertrag haben.
 *
 * Warum auf Papier: Eine Einwilligung darf nicht per E-Mail erfragt
 * werden - schon die Frage gilt als Werbung. Im Studio, beim nächsten
 * Training, ist sie dagegen eine Sache von zehn Sekunden. Das Kästchen
 * ist nicht vorangekreuzt, der Zettel ist freiwillig, und das Training
 * hängt nicht daran (Koppelungsverbot, Art. 7 Abs. 4 DSGVO).
 *
 * Den Wortlaut sollte vor dem ersten Einsatz jemand mit Rechtskenntnis
 * prüfen.
 */
export default async function EinwilligungDruckSeite() {
  await verlangeAdmin();

  return (
    <div className="mx-auto min-h-screen max-w-2xl bg-white px-8 py-10 text-neutral-900">
      <p className="text-2xl font-bold">
        Körper<span className="text-[#527012]">formen</span>
      </p>
      <h1 className="mt-6 text-xl font-semibold">Angebote, Neuigkeiten und Feedback per E-Mail und WhatsApp</h1>

      <div className="mt-8 space-y-6 text-sm leading-relaxed">
        <p>Name: ______________________________ Kundennummer: ___________</p>
        <p>E-Mail: ______________________________ Mobil: ________________</p>

        <p className="flex items-start gap-3 rounded-lg border border-neutral-300 p-4">
          <span className="mt-0.5 inline-block h-5 w-5 shrink-0 border-2 border-neutral-700" />
          <span>
            Ja, ich möchte von {legalConfig.companyName} ({legalConfig.owner}) per E-Mail und
            WhatsApp über Angebote, Aktionen und Neuigkeiten meines Studios informiert und
            gelegentlich nach meiner Zufriedenheit gefragt werden.
            Diese Einwilligung ist freiwillig und hat keinen Einfluss auf meine Mitgliedschaft. Ich
            kann sie jederzeit ohne Angabe von Gründen widerrufen - über den Abmeldelink in jeder
            Nachricht, in meinem Mitgliederbereich oder formlos gegenüber dem Studio.
          </span>
        </p>

        <p className="text-xs text-neutral-500">
          Mails, die zu deinem Vertrag gehören (Begrüßung, Hinweise zu Terminen), bekommst du
          unabhängig davon - sie lassen sich ebenfalls jederzeit abbestellen.
        </p>

        <p className="pt-10">______________________________ ______________________________</p>
        <p className="-mt-5 flex justify-between text-xs text-neutral-500">
          <span>Ort, Datum</span>
          <span className="mr-24">Unterschrift</span>
        </p>

        <p className="pt-6 text-xs text-neutral-500">
          Nur für das Studio: im Adminbereich unter Mitgliederliste beim Mitglied „Werbung
          erlaubt“ ankreuzen und den Zettel abheften.
        </p>
      </div>

      <div className="mt-10">
        <DruckKnopf />
      </div>
    </div>
  );
}
