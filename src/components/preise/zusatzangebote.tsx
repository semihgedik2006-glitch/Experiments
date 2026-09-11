import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { symbolFuer, type AngebotAnzeige } from "@/lib/zusatzangebote";

/**
 * Was es zusätzlich zum Training gibt.
 *
 * Bis hierher standen Ernährungsberatung und Messungen als Halbsatz in
 * einer Aufzählung von Preisfaktoren ("Zusatzleistungen sind möglich,
 * aber kein Muss"). Wer gezielt danach sucht - und das tun Leute, die
 * abnehmen wollen -, findet das dort nicht.
 *
 * Der Preis steht bewusst klein und unter dem Text: Das Angebot ist die
 * Aussage, der Betrag die Randbedingung. Umgekehrt läse sich der
 * Abschnitt wie eine Zusatzverkaufsliste.
 */
export function Zusatzangebote({
  angebote,
  /** Auf einer Standortseite: dort ist der Zusammenhang enger. */
  kompakt = false,
}: {
  angebote: AngebotAnzeige[];
  kompakt?: boolean;
}) {
  if (angebote.length === 0) return null;

  return (
    <section
      className={
        kompakt
          ? "border-t border-border py-16 sm:py-20"
          : "border-t border-border bg-surface py-20 sm:py-24"
      }
    >
      <Container>
        <SectionHeader
          kicker="Dazu buchbar"
          title={kompakt ? "Mehr als nur Training" : "Was es zusätzlich gibt"}
          intro={
            kompakt
              ? "Diese Angebote gibt es an diesem Standort - alle freiwillig, keines Voraussetzung für das Training."
              : "Alles davon ist freiwillig. Nichts davon ist Voraussetzung dafür, dass das Training wirkt - wer nur trainieren will, trainiert nur."
          }
          className="mb-12"
        />

        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {angebote.map((angebot) => {
            const Symbol = symbolFuer(angebot.symbol);
            return (
              <StaggerItem key={angebot.id} className="h-full">
                <div className="karte-hebt flex h-full flex-col rounded-2xl border border-border bg-surface-raised p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-lime/12 text-accent">
                    <Symbol size={20} aria-hidden />
                  </span>
                  <h3 className="mt-5 font-semibold">{angebot.name}</h3>
                  {angebot.text && (
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                      {angebot.text}
                    </p>
                  )}
                  {angebot.preis && (
                    <p className="mt-4 text-sm font-medium text-accent">{angebot.preis}</p>
                  )}
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Container>
    </section>
  );
}
