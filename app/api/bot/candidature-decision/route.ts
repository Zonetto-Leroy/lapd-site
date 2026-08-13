import { NextRequest, NextResponse } from "next/server";
import { applyCandidatureDecision } from "@/lib/candidature-decision";

/**
 * Appelée par clk-guardian-bot quand le staff clique Accepter/Refuser sur l'embed
 * posté dans #candidatures-services (Discord CLK) — authentifiée par un secret
 * partagé plutôt que par une session, puisque l'appelant est le bot, pas un membre connecté.
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-bot-secret");
  if (!secret || !process.env.LAPD_BOT_SECRET || secret !== process.env.LAPD_BOT_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const candidatureId = body?.candidatureId;
  const action = body?.action;
  const decidedBy = typeof body?.decidedBy === "string" ? body.decidedBy : "Discord";

  if (typeof candidatureId !== "string" || (action !== "accept" && action !== "refuse")) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const result = await applyCandidatureDecision(candidatureId, action, decidedBy);
  if (!result) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, ...result });
}
