import { StudiosSeite, studiosMetadaten } from "@/components/seiten/studios";

export const metadata = studiosMetadaten("de");

export default function StudioPage() {
  return <StudiosSeite sprache="de" />;
}
