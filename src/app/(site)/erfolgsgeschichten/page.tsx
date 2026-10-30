import { ErfolgeSeite, erfolgeMetadaten } from "@/components/seiten/erfolge";

export const metadata = erfolgeMetadaten("de");

export default function SuccessStoriesPage() {
  return <ErfolgeSeite sprache="de" />;
}
