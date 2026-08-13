import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { decideCandidature, listCandidatures } from "@/lib/candidatures";
import { updateUserRank } from "@/lib/users";
import { STARTING_RANK } from "@/lib/ranks";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.isStaff) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (body?.action !== "accept" && body?.action !== "refuse") {
    return NextResponse.json({ error: "Action invalide" }, { status: 400 });
  }

  const all = await listCandidatures();
  const target = all.find((c) => c.id === id);
  if (!target) {
    return NextResponse.json({ error: "Candidature introuvable" }, { status: 404 });
  }

  const updated = await decideCandidature(id, body.action === "accept" ? "accepted" : "refused", session.username);
  if (!updated) {
    return NextResponse.json({ error: "Échec de la mise à jour" }, { status: 503 });
  }

  if (body.action === "accept") {
    await updateUserRank(target.userId, STARTING_RANK, target.characterName);
  }

  return NextResponse.json({ ok: true, candidature: updated });
}
