import { FragenUebersicht, fragenMetadaten } from "@/components/seiten/fragen";

export const metadata = fragenMetadaten("en");

export default function QuestionsPage() {
  return <FragenUebersicht sprache="en" />;
}
