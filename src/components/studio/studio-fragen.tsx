import { ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/container";
import { FragenJsonLd } from "@/components/structured-data";
import type { Sprache } from "@/lib/sprache";

/**
 * Häufige Fragen zu genau diesem Standort.
 *
 * Der Anlass: Die vierzehn Standortseiten unterschieden sich bisher fast
 * nur in der Adresse, und nahezu gleiche Seiten wertet Google ab. Gesucht
 * wird aber genau so - "EMS Nippes Öffnungszeiten", "Probetraining
 * Hürth kostenlos".
 *
 * Jede Antwort stammt aus den Studiodaten (Adresse, Öffnungszeiten,
 * Telefon, Nachbarstandort) oder aus Aussagen, die ohnehin überall auf der
 * Seite stehen (20 Minuten, erster Termin kostenlos). Erfunden wird
 * nichts - keine Parkplätze, keine Haltestelle, die niemand geprüft hat.
 *
 * Ohne JavaScript: <details> klappt von allein auf, und der Text steht
 * vollständig im HTML, wo ihn auch Suchmaschinen lesen.
 */
export function StudioFragen({
  sprache,
  ort,
  anschrift,
  telefon,
  oeffnungszeiten,
  whatsapp,
  hatAnfahrt,
  nachbar,
  anzahlStudios,
}: {
  sprache: Sprache;
  ort: string;
  anschrift: string;
  telefon: string;
  oeffnungszeiten: string;
  whatsapp: string | null;
  hatAnfahrt: boolean;
  nachbar: { name: string; km: number | null } | null;
  anzahlStudios: number;
}) {
  const en = sprache === "en";
  const zeiten = oeffnungszeiten
    .split("\n")
    .map((z) => z.trim())
    .filter(Boolean)
    .join("; ");
  const km = nachbar?.km != null ? Math.max(1, Math.round(nachbar.km)) : null;

  const fragen: { frage: string; antwort: string }[] = en
    ? [
        {
          frage: `Where is the EMS studio in ${ort}?`,
          antwort: `You will find Körperformen ${ort} at ${anschrift}.${hatAnfahrt ? " How to get here is described above under “How to find us”." : ""}`,
        },
        {
          frage: `What are the opening hours in ${ort}?`,
          antwort: `${zeiten}. Training is by appointment - we agree a time that suits you.`,
        },
        {
          frage: `What does a trial session in ${ort} cost?`,
          antwort: `Nothing. Your first session is free and without obligation. Use the form on this page or call us on ${telefon}${whatsapp ? ", or send us a WhatsApp message" : ""}.`,
        },
        {
          frage: "How long does an EMS session take?",
          antwort: "A session takes 20 minutes, and a trainer is by your side the whole time.",
        },
        ...(nachbar
          ? [
              {
                frage: `Are there other Körperformen studios near ${ort}?`,
                antwort: `Yes. The nearest is ${nachbar.name}${km ? `, about ${km} km away` : ""}. There are ${anzahlStudios} Körperformen studios in Cologne and the surrounding area in total.`,
              },
            ]
          : []),
      ]
    : [
        {
          frage: `Wo ist das EMS-Studio in ${ort}?`,
          antwort: `Du findest Körperformen ${ort} unter der Adresse ${anschrift}.${hatAnfahrt ? " Wie du am besten hinkommst, steht weiter oben unter „So findest du uns“." : ""}`,
        },
        {
          frage: `Wann hat das Studio in ${ort} geöffnet?`,
          antwort: `${zeiten}. Trainiert wird mit Termin - den stimmen wir mit dir ab.`,
        },
        {
          frage: `Was kostet ein Probetraining in ${ort}?`,
          antwort: `Nichts. Der erste Termin ist kostenlos und unverbindlich. Melde dich einfach über das Formular auf dieser Seite oder telefonisch unter ${telefon}${whatsapp ? " - oder schreib uns per WhatsApp" : ""}.`,
        },
        {
          frage: "Wie lange dauert ein EMS-Training?",
          antwort: "Eine Einheit dauert 20 Minuten, dabei steht die ganze Zeit ein Trainer neben dir.",
        },
        ...(nachbar
          ? [
              {
                frage: `Gibt es weitere Körperformen-Studios in der Nähe von ${ort}?`,
                antwort: `Ja. Das nächste ist ${nachbar.name}${km ? `, etwa ${km} km entfernt` : ""}. Insgesamt gibt es ${anzahlStudios} Körperformen-Studios in Köln und Umgebung.`,
              },
            ]
          : []),
      ];

  return (
    <section className="border-t border-border py-20">
      <FragenJsonLd fragen={fragen} />
      <Container className="max-w-3xl">
        <h2 className="text-2xl font-bold tracking-tight">
          {en ? `Questions about the studio in ${ort}` : `Fragen zum Studio in ${ort}`}
        </h2>
        <div className="mt-6 divide-y divide-border rounded-2xl border border-border">
          {fragen.map((f) => (
            <details key={f.frage} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                {f.frage}
                <ChevronDown
                  size={18}
                  className="shrink-0 text-muted transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="mt-3 leading-relaxed text-muted">{f.antwort}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
