import { ProbeterminSeite, probeterminMetadaten } from "@/components/seiten/probetermin";

export const metadata = probeterminMetadaten("en");

export default function BookPage() {
  return <ProbeterminSeite sprache="en" />;
}
