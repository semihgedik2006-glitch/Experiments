import { FragenUebersicht, fragenMetadaten } from "@/components/seiten/fragen";

export const metadata = fragenMetadaten("de");

export default function QuestionsPage() {
  return <FragenUebersicht sprache="de" />;
}
