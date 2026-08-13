import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateUserRank } from "@/lib/users";
import { isRankCode } from "@/lib/ranks";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const session = await getSession();
  if (!session?.isStaff) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { userId } = await params;
  const body = await request.json().catch(() => null);

  // rank: null retire l'officier de l'effectif (radiation) sans supprimer son compte.
  if (body?.rank !== null && !isRankCode(body?.rank)) {
    return NextResponse.json({ error: "Grade invalide" }, { status: 400 });
  }

  await updateUserRank(
    userId,
    body.rank,
    typeof body.characterName === "string" ? body.characterName : undefined,
    typeof body.badgeNumber === "string" ? body.badgeNumber : undefined
  );
  return NextResponse.json({ ok: true });
}
