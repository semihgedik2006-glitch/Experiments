import { SubmitButton } from "@/components/admin/admin-form";
import { gespraechGefuehrt, gespraechZuruecksetzen, nachgehakt } from "@/lib/actions/admin-mitglieder";

export function AngerufenKnopf({ id }: { id: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await nachgehakt(id);
      }}
    >
      <SubmitButton>Angerufen</SubmitButton>
    </form>
  );
}

export function GespraechKnopf({ id, gefuehrt }: { id: string; gefuehrt: boolean }) {
  return (
    <form
      action={async () => {
        "use server";
        if (gefuehrt) await gespraechZuruecksetzen(id);
        else await gespraechGefuehrt(id);
      }}
    >
      <SubmitButton variant={gefuehrt ? "link" : "outline"}>
        {gefuehrt ? "Zurücksetzen" : "Gespräch geführt"}
      </SubmitButton>
    </form>
  );
}
