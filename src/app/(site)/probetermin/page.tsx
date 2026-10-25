import { ProbeterminSeite, probeterminMetadaten } from "@/components/seiten/probetermin";

export const metadata = probeterminMetadaten("de");

export default function ProbeterminPage() {
  return <ProbeterminSeite sprache="de" />;
}
