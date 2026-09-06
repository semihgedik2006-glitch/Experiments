import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CursorGlow } from "@/components/cursor-glow";
import { mainNav } from "@/lib/site-config";
import { getToggles } from "@/lib/site-toggles";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const toggles = await getToggles();

  // Ausgeblendete Bereiche verschwinden aus dem Menü - oben wie unten.
  // Einträge ohne eigenen Schalter (Startseite, EMS-Training, Kontakt)
  // bleiben immer sichtbar.
  const nav = mainNav.filter((item) => {
    const key = item.href.replace(/^\//, "");
    return !(key in toggles) || toggles[key as keyof typeof toggles];
  });

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-lime focus:px-5 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-lime"
      >
        Zum Inhalt springen
      </a>
      <CursorGlow />
      <Header nav={nav} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer nav={nav} showNewsletter={toggles.newsletter} />
    </>
  );
}
