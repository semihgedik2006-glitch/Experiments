import Link from "@/components/sprach-link";
import { Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { siteConfig } from "@/lib/site-config";
import { getStudios } from "@/lib/data";
import { isVisible } from "@/lib/site-toggles";
import { WhatsappKnopf } from "@/components/whatsapp-knopf";
import type { Sprache } from "@/lib/sprache";

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
  titel,
  text,
  sprache = "de",
}: {
  titel?: string;
  text?: string;
  sprache?: Sprache;
}) {
  const en = sprache === "en";
  titel ??= en ? "Rather ask directly?" : "Lieber direkt fragen?";
  text ??= en
    ? "What your training costs depends on how often you train and what you want to achieve. The quickest way is to talk to us - with no obligation."
    : "Was dein Training kostet, hängt davon ab, wie oft du trainierst und was du erreichen willst. Am schnellsten geht das im Gespräch - ganz unverbindlich.";
  const studios = (await isVisible("studio")) ? await getStudios() : [];

  // WhatsApp nur, wenn wenigstens ein Standort eine Nummer hinterlegt hat.
  // Genommen wird die des obersten - das ist derselbe Standort, dessen
  // Anschrift auch im Impressum als Hauptsitz steht.
  const mitWhatsapp = studios.find((studio) => studio.whatsapp?.trim());

  const wege = [
    {
      icon: Phone,
      label: en ? "Call" : "Anrufen",
      wert: siteConfig.contact.phone,
      href: `tel:${siteConfig.contact.phone.replace(/\s/g, "")}`,
      zusatz: en ? "Straight to the studio during opening hours" : "Zu den Öffnungszeiten direkt im Studio",
    },
    {
      icon: Mail,
      label: en ? "Send an email" : "E-Mail schreiben",
      wert: siteConfig.contact.email,
      href: `mailto:${siteConfig.contact.email}`,
      zusatz: en ? "Usually answered the same working day" : "Antwort in der Regel am selben Werktag",
    },
    {
      icon: MessageSquare,
      label: en ? "Fill in the form" : "Formular ausfüllen",
      wert: en ? "To the contact form" : "Zum Kontaktformular",
      href: en ? "/en/contact" : "/kontakt",
      zusatz: en ? "If you would like us to call you back" : "Wenn du zurückgerufen werden möchtest",
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
              className="karte-hebt karte-glanz card flex flex-col p-5"
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
              sprache={sprache}
              text={
                en
                  ? "Hello, I have a question about EMS training at Körperformen."
                  : "Hallo, ich habe eine Frage zum EMS-Training bei Körperformen."
              }
            />
          </div>
        )}

        {/* Bei vierzehn Standorten ist die zentrale Nummer nicht immer die
            richtige - jedes Studio hat eine eigene. */}
        {studios.length > 1 && (
          <p className="mt-5 flex flex-wrap items-center gap-2 text-sm text-muted">
            <MapPin size={15} className="text-accent" />
            {en ? "You can also reach every studio directly –" : "Du erreichst auch jedes Studio direkt –"}{" "}
            {/* Link statt <a>: Next lädt damit nur den geänderten Teil der
                Seite nach, statt sie komplett neu aufzubauen. */}
            <Link href="/studio" className="text-accent underline underline-offset-2">
              {en ? `all ${studios.length} studios with phone numbers` : `alle ${studios.length} Standorte mit Telefonnummer`}
            </Link>
          </p>
        )}
      </Container>
    </section>
  );
}
