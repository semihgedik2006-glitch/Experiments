import { prisma } from "@/lib/prisma";
import { EnglischBlock, EnglischFeld } from "@/components/admin/englisch-block";
import { createFaqItem, updateFaqItem, deleteFaqItem } from "@/lib/actions/admin-faq";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { AdminPage, EmptyState, adminInput } from "@/components/admin/ui";
import { HelpCircle } from "lucide-react";
import { verlangeLeitung } from "@/lib/admin-rechte";

export default async function AdminFaqPage() {
  await verlangeLeitung();
  const items = await prisma.faqItem.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <AdminPage
      title="Häufige Fragen"
      description={
        <>
          Diese Einträge erscheinen auf der Startseite, der Preise-Seite und der
          EMS-Training-Seite. Kleinere Zahl bei &bdquo;Position&ldquo; = weiter oben.
        </>
      }
    >
      {/* Neue Frage anlegen */}
      <AdminForm
        action={createFaqItem}
        resetOnSuccess
        className="admin-panel border-lime/40 p-4 sm:p-5"
      >
        <h2 className="text-base font-semibold">Neue Frage hinzufügen</h2>
        <div className="mt-4 space-y-3">
          <input
            type="text"
            name="question"
            required
            maxLength={200}
            placeholder="Frage"
            className={adminInput}
          />
          <textarea
            name="answer"
            required
            rows={3}
            maxLength={2000}
            placeholder="Antwort"
            className={adminInput}
          />
          <EnglischBlock>
            <EnglischFeld label="Question (Frage)">
              <input type="text" name="questionEn" maxLength={200} className={adminInput} />
            </EnglischFeld>
            <EnglischFeld label="Answer (Antwort)">
              <textarea name="answerEn" rows={3} maxLength={2000} className={adminInput} />
            </EnglischFeld>
          </EnglischBlock>
        </div>
        <div className="mt-4">
          <SubmitButton variant="primary" pendingLabel="Wird angelegt..." savedLabel="Angelegt">
            Frage anlegen
          </SubmitButton>
        </div>
      </AdminForm>

      {/* Bestehende Fragen bearbeiten */}
      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="admin-panel p-4 sm:p-5">
            <AdminForm action={updateFaqItem} className="space-y-3">
              <input type="hidden" name="id" value={item.id} />
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-xs text-muted">
                  Position{" "}
                  <input
                    type="number"
                    name="sortOrder"
                    defaultValue={item.sortOrder}
                    className={`${adminInput} ml-1 w-20`}
                  />
                </label>
              </div>
              <input
                type="text"
                name="question"
                required
                maxLength={200}
                defaultValue={item.question}
                className={`${adminInput} font-medium`}
              />
              <textarea
                name="answer"
                required
                rows={3}
                maxLength={2000}
                defaultValue={item.answer}
                className={adminInput}
              />
              <EnglischBlock ausgefuellt={!!(item.questionEn || item.answerEn)}>
                <EnglischFeld label="Question (Frage)">
                  <input type="text" name="questionEn" maxLength={200} defaultValue={item.questionEn ?? ""} className={adminInput} />
                </EnglischFeld>
                <EnglischFeld label="Answer (Antwort)">
                  <textarea name="answerEn" rows={3} maxLength={2000} defaultValue={item.answerEn ?? ""} className={adminInput} />
                </EnglischFeld>
              </EnglischBlock>
              <div className="flex gap-2">
                <SubmitButton pendingLabel="Wird gespeichert...">Speichern</SubmitButton>
              </div>
            </AdminForm>
            <form
              action={async () => {
                "use server";
                await deleteFaqItem(item.id);
              }}
              className="mt-2"
            >
              <ConfirmButton question="Diese Frage wirklich löschen?" />
            </form>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="mt-6">
          <EmptyState icon={HelpCircle} title="Noch keine Fragen hinterlegt">
            Der Frage-und-Antwort-Block erscheint erst, wenn hier mindestens ein Eintrag
            steht. Er beantwortet die Fragen, die sonst am Telefon gestellt werden -
            Preis, Dauer, Kleidung, Vertragsbindung.
          </EmptyState>
        </div>
      )}
    </AdminPage>
  );
}
