/** Der Hinweis über einer Seite, die nur Admins als Vorschau sehen (@/lib/vorschau). */
export function VorschauHinweis() {
  return (
    <div className="bg-amber-300 px-6 py-2 text-center text-sm font-semibold text-black">
      Vorschau – diese Seite ist noch nicht öffentlich. Einschalten im Adminbereich unter „Sichtbarkeit“.
    </div>
  );
}
