import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { isVisible } from "@/lib/site-toggles";
import { darfErscheinen, ERGEBNIS_HINWEIS } from "@/lib/verwandlung";

/**
 * Die Vorher-Nachher-Bilder auf der Seite „Erfolgsgeschichten“.
 *
 * Nebeneinander statt Schieberegler. Ein Regler, den man über das Bild
 * zieht, sieht beeindruckender aus - und genau das ist der Einwand: Er
 * blendet eines der beiden Bilder aus, und was man nicht sieht, kann man
 * nicht vergleichen. Nebeneinander stehen beide gleichzeitig da,
 * gleich groß, gleich beschriftet, und funktionieren ohne Zeigegerät und
 * ohne JavaScript.
 *
 * Zwei Angaben stehen immer unter jedem Paar - Zeitraum und Zusammenhang.
 * Sie sind nicht schmückendes Beiwerk, sondern der Unterschied zwischen
 * einer Aussage und einem Versprechen (siehe src/lib/verwandlung.ts).
 *
 * Und: Der Abschnitt verschwindet vollständig, wenn kein einziger
 * freigegebener Eintrag übrig ist. Eine Überschrift über einer leeren
 * Fläche wäre schlechter als gar nichts.
 */

/** Was wirklich erscheinen darf - zweite Prüfung, absichtlich doppelt. */
async function freigegebene() {
  const eintraege = await prisma.verwandlung.findMany({
    where: { aktiv: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      zeitraum: true,
      kontext: true,
      text: true,
      vorherUrl: true,
      nachherUrl: true,
      einwilligungAm: true,
      studio: { select: { name: true } },
    },
  });

  // Die Serveraktion setzt "aktiv" schon beim Speichern zurück, wenn
  // etwas fehlt. Hier wird trotzdem noch einmal geprüft: Ein Eintrag, der
  // auf anderem Weg in die Datenbank gelangt - eingespielte Sicherung,
  // Hand an der Datenbank -, hätte diese Prüfung sonst nie durchlaufen.
  return eintraege.filter(darfErscheinen);
}

export async function VerwandlungenWand() {
  if (!(await isVisible("verwandlungen"))) return null;

  const eintraege = await freigegebene();
  if (eintraege.length === 0) return null;

  return (
    <section className="border-t border-border bg-surface py-20 sm:py-24">
      <Container>
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Vorher und nachher
          </h2>
          <p className="mt-4 max-w-2xl text-muted">
            Alle abgebildeten Personen haben der Veröffentlichung ihrer Bilder
            ausdrücklich zugestimmt. Unter jedem Paar steht, über welchen
            Zeitraum es geht und was dabei sonst noch eine Rolle gespielt hat -
            ohne diese beiden Angaben zeigen wir kein Bild.
          </p>
        </Reveal>

        {/* Bei einem einzigen Paar kein zweispaltiges Raster: Die Karte
            stünde sonst links und rechts daneben bliebe eine leere Hälfte,
            die aussieht, als fehle dort etwas. */}
        <Stagger
          className={`mt-12 grid gap-8 ${
            eintraege.length === 1 ? "max-w-2xl" : "lg:grid-cols-2"
          }`}
        >
          {eintraege.map((eintrag) => (
            <StaggerItem key={eintrag.id}>
              <figure className="karte-hebt h-full overflow-hidden rounded-2xl border border-border bg-surface-raised">
                <div className="grid grid-cols-2 gap-px bg-border">
                  <Bild url={eintrag.vorherUrl} marke="Vorher" name={eintrag.name} />
                  <Bild url={eintrag.nachherUrl} marke="Nachher" name={eintrag.name} />
                </div>

                <figcaption className="p-6">
                  <p className="font-semibold">
                    {eintrag.name}
                    {eintrag.studio && (
                      <span className="font-normal text-muted"> · {eintrag.studio.name}</span>
                    )}
                  </p>
                  {/* Zeitraum und Zusammenhang zuerst und in der Textfarbe
                      der Seite, nicht klein und grau darunter: Sie
                      gehören zur Aussage des Bildpaars, sie relativieren
                      sie nicht. */}
                  <dl className="mt-3 space-y-1 text-sm">
                    <div className="flex gap-2">
                      <dt className="shrink-0 text-muted">Zeitraum:</dt>
                      <dd>{eintrag.zeitraum}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="shrink-0 text-muted">Dabei:</dt>
                      <dd>{eintrag.kontext}</dd>
                    </div>
                  </dl>

                  {eintrag.text && (
                    <blockquote className="mt-4 border-l-2 border-lime pl-4 text-sm leading-relaxed text-foreground/90">
                      &bdquo;{eintrag.text}&ldquo;
                    </blockquote>
                  )}
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Der Pflichthinweis. Er steht am Ende des Abschnitts und nicht
            in der Fußzeile: Dort läse ihn niemand, der die Bilder
            angesehen hat. */}
        <p className="mt-10 max-w-3xl text-xs leading-relaxed text-muted">{ERGEBNIS_HINWEIS}</p>
      </Container>
    </section>
  );
}

/**
 * Ein einzelnes Bild mit seiner Beschriftung.
 *
 * Die Beschriftung liegt im Bild und ist zugleich der Alternativtext:
 * Wer die Seite vorlesen lässt, hört „Vorher, Lena“ - und weiß damit
 * genauso viel wie jemand, der das Bild sieht. Eine Bildbeschreibung, die
 * beschreibt, wie jemand aussieht, wäre hier übergriffig.
 */
function Bild({ url, marke, name }: { url: string; marke: string; name: string }) {
  return (
    <div className="relative aspect-[3/4] bg-surface">
      {/* Einfaches img-Element: Die Adressen pflegt das Studio im Admin
          frei, sie stehen nicht vorab in der Konfiguration. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={`${marke}: ${name}`}
        loading="lazy"
        className="h-full w-full object-cover"
      />
      {/* Deckende Fläche, keine durchscheinende: Was dahinter liegt, ist
          ein beliebiges Foto - bei einem hellen Bild wäre die Schrift auf
          halbtransparentem Grund nicht mehr zu lesen, und niemand würde
          es bemerken, weil das Bild ja erst später eingetragen wird. */}
      <span className="absolute left-3 top-3 rounded-full border border-border bg-surface-raised px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground">
        {marke}
      </span>
    </div>
  );
}
