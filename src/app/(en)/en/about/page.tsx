import { UeberUnsSeite, ueberUnsMetadaten } from "@/components/seiten/ueber-uns";

export const metadata = ueberUnsMetadaten("en");

export default function AboutPage() {
  return <UeberUnsSeite sprache="en" />;
}
