import { SiteRahmen } from "@/components/layout/site-rahmen";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteRahmen sprache="de">{children}</SiteRahmen>;
}
