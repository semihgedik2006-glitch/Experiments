import { Hero } from "@/components/home/hero";
import { StatsStrip } from "@/components/home/stats-strip";
import { UspGrid } from "@/components/home/usp-grid";
import { HowItWorks } from "@/components/home/how-it-works";
import { StudioTeaser } from "@/components/home/studio-teaser";
import { TestimonialsTeaser } from "@/components/home/testimonials-teaser";
import { TrustSection } from "@/components/trust-section";
import { BlogTeaser } from "@/components/home/blog-teaser";
import { FaqSection } from "@/components/faq-section";
import { CtaBanner } from "@/components/cta-banner";
import { StudioJsonLd, WebsiteJsonLd, FaqJsonLd } from "@/components/structured-data";
import { getToggles } from "@/lib/site-toggles";

export default async function Home() {
  // Ausgeblendete Bereiche entfallen auch auf der Startseite - sonst
  // verlinken Teaser auf Seiten, die nicht mehr erreichbar sind.
  const toggles = await getToggles();

  return (
    <>
      <StudioJsonLd />
      <WebsiteJsonLd />
      <FaqJsonLd />
      <Hero />
      <StatsStrip />
      <UspGrid />
      <HowItWorks />
      {toggles.studio && <StudioTeaser />}
      {toggles.erfolgsgeschichten && <TestimonialsTeaser />}
      <TrustSection />
      {toggles.blog && <BlogTeaser />}
      <FaqSection />
      <CtaBanner />
    </>
  );
}
