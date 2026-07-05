import { Faq } from "@/components/faq";
import { getFaqItems } from "@/lib/data";

/** Server wrapper: loads the admin-editable FAQ entries from the database. */
export async function FaqSection() {
  const items = await getFaqItems();
  return <Faq items={items.map(({ question, answer }) => ({ question, answer }))} />;
}
