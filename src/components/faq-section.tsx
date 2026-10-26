import { Faq } from "@/components/faq";
import { getFaqItems } from "@/lib/data";
import type { Sprache } from "@/lib/sprache";
import { lokal } from "@/lib/i18n/lokal";

/** Server wrapper: loads the admin-editable FAQ entries from the database. */
export async function FaqSection({ sprache = "de" }: { sprache?: Sprache }) {
  const items = await getFaqItems();
  return (
    <Faq
      items={items.map((item) => ({
        question: lokal(sprache, item.question, item.questionEn),
        answer: lokal(sprache, item.answer, item.answerEn),
      }))}
    />
  );
}
