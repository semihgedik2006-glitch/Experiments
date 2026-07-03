import { Hero } from "@/components/home/hero";
import { VestScrollShowcase } from "@/components/home/vest-scroll-showcase";
import { StatsStrip } from "@/components/home/stats-strip";
import { UspGrid } from "@/components/home/usp-grid";
import { HowItWorks } from "@/components/home/how-it-works";
import { StudioTeaser } from "@/components/home/studio-teaser";
import { BlogTeaser } from "@/components/home/blog-teaser";
import { Faq } from "@/components/faq";
import { CtaBanner } from "@/components/cta-banner";

export default function Home() {
  return (
    <>
      <Hero />
      <VestScrollShowcase />
      <StatsStrip />
      <UspGrid />
      <HowItWorks />
      <StudioTeaser />
      <BlogTeaser />
      <Faq />
      <CtaBanner />
    </>
  );
}
