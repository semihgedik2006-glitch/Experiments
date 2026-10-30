import { EmsSeite, emsMetadaten } from "@/components/seiten/ems-training";

export const metadata = emsMetadaten("de");

export default function EmsTrainingPage() {
  return <EmsSeite sprache="de" />;
}
