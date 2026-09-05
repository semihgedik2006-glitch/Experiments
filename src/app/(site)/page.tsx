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

export default async function Home() {
  return (
    <>
      <StudioJsonLd />
      <WebsiteJsonLd />
      <FaqJsonLd />
      <Hero />
      <StatsStrip />
      <UspGrid />
      <HowItWorks />
      <StudioTeaser />
      <TestimonialsTeaser />
      <TrustSection />
      <BlogTeaser />
      <FaqSection />
      <CtaBanner />
    </>
  );
}
