import { StudiosSeite, studiosMetadaten } from "@/components/seiten/studios";

export const metadata = studiosMetadaten("en");

export default function StudiosPage() {
  return <StudiosSeite sprache="en" />;
}
