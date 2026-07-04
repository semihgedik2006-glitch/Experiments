import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CursorGlow } from "@/components/cursor-glow";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-lime focus:px-5 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#0d0d0f]"
      >
        Zum Inhalt springen
      </a>
      <CursorGlow />
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
