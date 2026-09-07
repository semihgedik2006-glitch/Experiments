import { Eye, EyeOff } from "lucide-react";
import { getToggles, toggleDefinitions } from "@/lib/site-toggles";
import { saveToggles } from "@/lib/actions/admin-toggles";
import { AdminStagger, AdminStaggerItem } from "@/components/admin/admin-stagger";
import { AdminForm, SubmitButton } from "@/components/admin/admin-form";
import { AdminPage } from "@/components/admin/ui";

export default async function AdminSichtbarkeitPage() {
  const toggles = await getToggles();
  const hiddenCount = toggleDefinitions.filter((entry) => !toggles[entry.key]).length;

  return (
    <AdminPage
      title="Sichtbarkeit"
      description={
        <>
          Hier bestimmst du, welche Bereiche der Website angezeigt werden. Was du
          ausblendest, verschwindet aus dem Menü, von der Startseite, aus der Suche
          und aus der Sitemap für Google. Die zugehörige Seite ist dann auch über
          einen Direktlink nicht mehr erreichbar.
        </>
      }
    >
      <p className="max-w-2xl text-sm text-muted">
        Nichts wird dabei gelöscht: Blogbeiträge, Kommentare und Texte bleiben
        erhalten und erscheinen wieder, sobald du den Schalter zurückstellst.
      </p>

      {hiddenCount > 0 && (
        <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm">
          <EyeOff size={15} />
          {hiddenCount === 1
            ? "Ein Bereich ist derzeit ausgeblendet."
            : `${hiddenCount} Bereiche sind derzeit ausgeblendet.`}
        </p>
      )}

      <AdminForm action={saveToggles} className="mt-6">
        <AdminStagger className="space-y-3">
          {toggleDefinitions.map((entry) => {
            const visible = toggles[entry.key];
            return (
              <AdminStaggerItem key={entry.key}>
                <label
                  className={`admin-panel flex cursor-pointer items-start gap-3 p-4 transition-colors ${
                    visible ? "" : "border-amber-500/40 bg-amber-500/5"
                  }`}
                >
                  <input
                    type="checkbox"
                    name={entry.key}
                    defaultChecked={visible}
                    className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-lime)]"
                  />
                  <span>
                    <span className="flex flex-wrap items-center gap-2 font-semibold">
                      {entry.label}
                      {entry.href && (
                        <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-normal text-muted">
                          {entry.href}
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-normal ${
                          visible ? "text-muted" : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {visible ? <Eye size={13} /> : <EyeOff size={13} />}
                        {visible ? "sichtbar" : "ausgeblendet"}
                      </span>
                    </span>
                    <span className="mt-1.5 block text-sm text-muted">{entry.description}</span>
                  </span>
                </label>
              </AdminStaggerItem>
            );
          })}
        </AdminStagger>

        <div className="mt-6">
          <SubmitButton variant="primary" pendingLabel="Wird übernommen...">
            Sichtbarkeit speichern
          </SubmitButton>
        </div>
      </AdminForm>
    </AdminPage>
  );
}
