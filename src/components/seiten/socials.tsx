import type { Metadata } from "next";
import { ArrowUpRight, AtSign } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { InstagramWand } from "@/components/instagram-wand";
import { InstagramIcon, FacebookIcon, TikTokIcon, type SymbolProps } from "@/components/icons/social-icons";
import { WegLeiste } from "@/components/weg-leiste";
import { siteConfig } from "@/lib/site-config";
import { getToggles } from "@/lib/site-toggles";
import { letzteBeitraege } from "@/lib/instagram";
import type { Sprache } from "@/lib/sprache";
import { seitenMetadaten } from "@/lib/i18n/metadaten";

export function socialsMetadaten(sprache: Sprache): Metadata {
  return seitenMetadaten(sprache, "/socials", {
    title: "Socials",
    description:
      sprache === "en"
        ? "Körperformen on Instagram, TikTok and Facebook: a look inside the studio, trainer tips and news."
        : "Körperformen auf Instagram, TikTok und Facebook: Einblicke ins Studio, Trainer-Tipps und Neuigkeiten.",
  });
}

/**
 * Die Socials-Seite - ein Ort, an dem alle Kanäle zusammen stehen.
 *
 * Bisher gab es sie nur als drei kleine Symbole in der Fußzeile. Hier
 * steht zu jedem Kanal, was man dort findet - ein Grund zu folgen ist
 * mehr wert als ein Symbol.
 *
 * Die Adressen kommen aus site-config. Ein neuer Kanal (YouTube,
 * LinkedIn) ist dort ein Eintrag und hier eine Zeile in KANAELE.
 */
const KANAELE: {
  name: string;
  href: string;
  Icon: (props: SymbolProps) => React.ReactNode;
  was: string;
  wasEn: string;
  farbe: string;
}[] = [
  {
    name: "Instagram",
    href: siteConfig.social.instagram,
    Icon: InstagramIcon,
    was: "Einblicke ins Studio, Trainer-Tipps und Geschichten aus dem Alltag.",
    wasEn: "A look inside the studio, trainer tips and everyday stories.",
    farbe: "kanal-instagram",
  },
  {
    name: "TikTok",
    href: siteConfig.social.tiktok,
    Icon: TikTokIcon,
    was: "Kurze Clips: Übungen, Studio-Momente und ein Blick hinter die Kulissen.",
    wasEn: "Short clips: exercises, studio moments and a look behind the scenes.",
    farbe: "kanal-tiktok",
  },
  {
    name: "Facebook",
    href: siteConfig.social.facebook,
    Icon: FacebookIcon,
    was: "Neuigkeiten, Aktionen und Termine aus den Studios.",
    wasEn: "News, offers and dates from the studios.",
    farbe: "kanal-facebook",
  },
];

/** "https://instagram.com/koerperformen_huerth" -> "@koerperformen_huerth" */
function handle(href: string) {
  const teil = href.replace(/\/+$/, "").split("/").pop() ?? "";
  return teil.startsWith("@") ? teil : `@${teil}`;
}

export async function SocialsSeite({ sprache }: { sprache: Sprache }) {
  const en = sprache === "en";
  const toggles = await getToggles();
  const instagram = toggles.instagram ? await letzteBeitraege() : [];

  return (
    <>
      <PageHeader
        kicker="Socials"
        title={
          en ? (
            <>
              Come <span className="text-accent-strong">behind the scenes</span>
            </>
          ) : (
            <>
              Komm mit <span className="text-accent-strong">hinter die Kulissen</span>
            </>
          )
        }
        intro={en ? "What happens at the studio, you see here first." : "Was im Studio passiert, siehst du hier zuerst."}
      />

      <section className="py-16 sm:py-20">
        <Container>
          <Stagger className="grid gap-5 md:grid-cols-3">
            {KANAELE.map(({ name, href, Icon, was, wasEn, farbe }) => (
              <StaggerItem key={name} className="h-full">
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`kanal ${farbe} karte-hebt group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface p-7`}
                >
                  <span aria-hidden className="kanal-schein pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full" />
                  <span className="relative flex items-center justify-between">
                    <span className="kanal-symbol flex h-14 w-14 items-center justify-center rounded-2xl text-white">
                      <Icon size={26} aria-hidden />
                    </span>
                    <ArrowUpRight
                      size={22}
                      className="text-muted transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-foreground"
                      aria-hidden
                    />
                  </span>
                  <span className="relative mt-8 text-2xl font-bold tracking-tight">{name}</span>
                  <span className="relative mt-1 text-sm font-medium text-accent">{handle(href)}</span>
                  <span className="relative mt-4 flex-1 text-sm leading-relaxed text-muted">{en ? wasEn : was}</span>
                  <span className="relative mt-6 inline-flex w-fit items-center rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors group-hover:border-lime">
                    {en ? "Follow" : "Folgen"}
                  </span>
                </a>
              </StaggerItem>
            ))}
          </Stagger>

          <div className="on-ink mt-10 flex bg-background text-foreground flex-col items-start gap-5 rounded-3xl p-7 sm:flex-row sm:items-center sm:p-10">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-lime text-on-lime">
              <AtSign size={26} aria-hidden />
            </span>
            <div>
              <p className="text-xl font-bold tracking-tight ">
                {en ? "Your moment at the studio?" : "Dein Moment im Studio?"}
              </p>
              <p className="mt-1 text-sm text-white/75">
                {en
                  ? `Tag us with ${handle(siteConfig.social.instagram)} – we are happy to share the best posts (only with your okay, of course).`
                  : `Markier uns mit ${handle(siteConfig.social.instagram)} – die schönsten Beiträge teilen wir gern (natürlich nur mit deinem Okay).`}
              </p>
            </div>
          </div>
        </Container>
      </section>

      <InstagramWand beitraege={instagram} sprache={sprache} />

      <WegLeiste aktuell="dabeibleiben" />
    </>
  );
}
