import { Hero } from "@/components/home/hero";
import { UspGrid } from "@/components/home/usp-grid";
import { HowItWorks } from "@/components/home/how-it-works";
import { StudioTeaser } from "@/components/home/studio-teaser";
import { PricingTeaser } from "@/components/home/pricing-teaser";
import { BlogTeaser } from "@/components/home/blog-teaser";
import { Faq } from "@/components/faq";
import { CtaBanner } from "@/components/cta-banner";

export default function Home() {
  return (
    <>
      <Hero />
      <UspGrid />
      <HowItWorks />
      <StudioTeaser />
      <PricingTeaser />
      <BlogTeaser />
      <Faq />
      <CtaBanner />
    </>
  );
}
