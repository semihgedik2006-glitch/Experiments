import { NextRequest, NextResponse } from "next/server";
import { syncSlotsForAllTemplates } from "@/lib/slot-templates";

// Called daily by Vercel Cron (see vercel.json) to keep the rolling
// window of auto-generated availability slots topped up for every
// active recurring template.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }
  }

  const result = await syncSlotsForAllTemplates();
  return NextResponse.json({ ok: true, ...result });
}
