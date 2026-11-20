import { prisma } from "@/lib/prisma";
import { entwurfUebernehmen, entwurfVerwerfen } from "@/lib/actions/admin-nox-entwuerfe";
import { SubmitButton } from "@/components/admin/admin-form";

const FELD = { intro: "Einleitung", anfahrt: "Anfahrt" } as const;

export async function NoxEntwuerfe({ art, studioIds }: { art: "faq" | "studio"; studioIds?: string[] }) {
  const entwuerfe = await prisma.noxEntwurf.findMany({
    where: { art, ...(studioIds ? { studioId: { in: studioIds } } : {}) },
    orderBy: { createdAt: "asc" },
  });
  if (entwuerfe.length === 0) return null;
  const studios = art === "studio"
    ? await prisma.studioLocation.findMany({ where: { id: { in: entwuerfe.map((e) => e.studioId ?? "") } }, select: { id: true, name: true, intro: true, anfahrt: true } })
    : [];

  return (
    <section className="admin-panel mb-6 border-lime/40 p-4 sm:p-5">
      <h2 className="text-base font-semibold">Vorschläge von Nox</h2>
      <p className="mt-1 text-sm text-muted">Erst „Übernehmen“ stellt den Text auf die Seite.</p>
      <ul className="mt-4 divide-y divide-border">
        {entwuerfe.map((e) => {
          const studio = studios.find((s) => s.id === e.studioId);
          const feld = e.feld === "anfahrt" ? "anfahrt" : "intro";
          const bisher = studio?.[feld]?.trim();
          return (
            <li key={e.id} className="py-4 first:pt-0 last:pb-0">
              {art === "faq" ? (
                <p className="font-medium">{e.frage}</p>
              ) : (
                <p className="font-medium">{studio?.name ?? "Studio gelöscht"} · {FELD[feld]}</p>
              )}
              <p className="mt-1 whitespace-pre-line text-sm">{e.text}</p>
              {(e.frageEn || e.textEn) && (
                <p className="mt-2 whitespace-pre-line text-sm text-muted">
                  <span className="font-medium">Englisch: </span>
                  {[e.frageEn, e.textEn].filter(Boolean).join(" · ")}
                </p>
              )}
              {art === "studio" && (
                <p className="mt-2 whitespace-pre-line text-xs text-muted">Bisher: {bisher || "noch kein eigener Text"}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <form action={entwurfUebernehmen}>
                  <input type="hidden" name="id" value={e.id} />
                  <SubmitButton variant="primary" pendingLabel="Wird übernommen...">Übernehmen</SubmitButton>
                </form>
                <form action={entwurfVerwerfen}>
                  <input type="hidden" name="id" value={e.id} />
                  <SubmitButton pendingLabel="Wird verworfen...">Verwerfen</SubmitButton>
                </form>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
