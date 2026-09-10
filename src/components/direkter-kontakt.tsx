import Link from "next/link";
import { Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { siteConfig } from "@/lib/site-config";
import { getStudios } from "@/lib/data";
import { isVisible } from "@/lib/site-toggles";
import { WhatsappKnopf } from "@/components/whatsapp-knopf";

/**
 * Direkter Kontaktweg.
 *
 * Gedacht für die Preisseite: Dort steht bewusst keine Zahl, weil die
 * Pakete individuell sind. Wer trotzdem nach einer Zahl sucht und keine
 * findet, verlässt die Seite - es sei denn, das Fragen ist einfacher als
 * das Weitersuchen. Deshalb Telefonnummer, E-Mail und Formular als
 * gleichwertige Wege nebeneinander, nicht nur ein Link ins Kontaktformular.
 *
 * Die Telefonnummer ist als tel:-Link hinterlegt: Auf dem Handy ist das ein
 * Antippen statt Abtippen.
 */
export async function DirekterKontakt({
  titel = "Lieber direkt fragen?",
  text = "Was dein Training kostet, hängt davon ab, wie oft du trainierst und was du erreichen willst. Am schnellsten geht das im Gespräch - ganz unverbindlich.",
}: {
  titel?: string;
  text?: string;
}) {
  const studios = (await isVisible("studio")) ? await getStudios() : [];

  // WhatsApp nur, wenn wenigstens ein Standort eine Nummer hinterlegt hat.
  // Genommen wird die des obersten - das ist derselbe Standort, dessen
  // Anschrift auch im Impressum als Hauptsitz steht.
  const mitWhatsapp = studios.find((studio) => studio.whatsapp?.trim());

  const wege = [
    {
      icon: Phone,
      label: "Anrufen",
      wert: siteConfig.contact.phone,
      href: `tel:${siteConfig.contact.phone.replace(/\s/g, "")}`,
      zusatz: "Zu den Öffnungszeiten direkt im Studio",
    },
    {
      icon: Mail,
      label: "E-Mail schreiben",
      wert: siteConfig.contact.email,
      href: `mailto:${siteConfig.contact.email}`,
      zusatz: "Antwort in der Regel am selben Werktag",
    },
    {
      icon: MessageSquare,
      label: "Formular ausfüllen",
      wert: "Zum Kontaktformular",
      href: "/kontakt",
      zusatz: "Wenn du zurückgerufen werden möchtest",
    },
  ];

  return (
    <section className="border-t border-border py-20 sm:py-24">
      <Container>
        <Reveal className="max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{titel}</h2>
          <p className="mt-3 text-muted">{text}</p>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {wege.map((weg) => (
            <a
              key={weg.label}
              href={weg.href}
              className="card flex flex-col p-5 transition-colors hover:border-lime"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lime/12 text-accent">
                <weg.icon size={17} aria-hidden />
              </span>
              <span className="mt-3 text-sm text-muted">{weg.label}</span>
              <span className="mt-0.5 font-semibold">{weg.wert}</span>
              <span className="mt-2 text-xs text-muted">{weg.zusatz}</span>
            </a>
          ))}
        </div>

        {/* WhatsApp steht unter den drei Karten und nicht als vierte: Es
            ist ein zusätzlicher Weg, kein gleichwertiger - nicht jeder
            Standort hat eine Nummer, und dann stünde dort eine Lücke. */}
        {mitWhatsapp?.whatsapp && (
          <div className="mt-5">
            <WhatsappKnopf
              nummer={mitWhatsapp.whatsapp}
              variante="schlicht"
              text="Hallo, ich habe eine Frage zum EMS-Training bei Körperformen."
            />
          </div>
        )}

        {/* Bei vierzehn Standorten ist die zentrale Nummer nicht immer die
            richtige - jedes Studio hat eine eigene. */}
        {studios.length > 1 && (
          <p className="mt-5 flex flex-wrap items-center gap-2 text-sm text-muted">
            <MapPin size={15} className="text-accent" />
            Du erreichst auch jedes Studio direkt &ndash;{" "}
            {/* Link statt <a>: Next lädt damit nur den geänderten Teil der
                Seite nach, statt sie komplett neu aufzubauen. */}
            <Link href="/studio" className="text-accent underline underline-offset-2">
              alle {studios.length} Standorte mit Telefonnummer
            </Link>
          </p>
        )}
      </Container>
    </section>
  );
}
