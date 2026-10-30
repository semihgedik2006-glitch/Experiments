import { ZielCheckSeite, zielCheckMetadaten } from "@/components/seiten/ziel-check";

export const metadata = zielCheckMetadaten("de");

export default function GoalCheckPage() {
  return <ZielCheckSeite sprache="de" />;
}
