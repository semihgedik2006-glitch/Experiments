import { UserRound, ShieldCheck, FileText, Lock } from "lucide-react";
import { trustPoints } from "@/lib/trust-config";

const icons = {
  user: UserRound,
  shield: ShieldCheck,
  file: FileText,
  lock: Lock,
};

/**
 * Schmale Fassung der Vertrauensbeweise für Formularseiten.
 *
 * Steht bewusst direkt beim Formular: Genau dort entscheidet sich, ob
 * jemand seine Daten hinterlässt, und genau dort tauchen die Zweifel auf
 * ("binde ich mich damit an etwas?").
 */
export function TrustBar({ className = "" }: { className?: string }) {
  return (
    <ul className={`grid gap-x-6 gap-y-4 text-sm text-muted sm:grid-cols-2 ${className}`}>
      {trustPoints.map((point) => {
        const Icon = icons[point.icon];
        return (
          <li key={point.title} className="flex items-start gap-2.5">
            <Icon size={16} className="mt-0.5 shrink-0 text-lime" />
            <span>
              <span className="font-medium text-foreground">{point.title}</span>
              <span className="hidden sm:inline"> - </span>
              <span className="block sm:inline">{point.text}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
