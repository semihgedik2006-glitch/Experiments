import { UeberUnsSeite, ueberUnsMetadaten } from "@/components/seiten/ueber-uns";

export const metadata = ueberUnsMetadaten("de");

export default function AboutPage() {
  return <UeberUnsSeite sprache="de" />;
}
