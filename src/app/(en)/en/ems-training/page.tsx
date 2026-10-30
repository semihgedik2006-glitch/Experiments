import { EmsSeite, emsMetadaten } from "@/components/seiten/ems-training";

export const metadata = emsMetadaten("en");

export default function EmsTrainingPage() {
  return <EmsSeite sprache="en" />;
}
