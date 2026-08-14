import { NextRequest, NextResponse } from "next/server";
import { getFreshSession } from "@/lib/auth";
import { getUserById, updateUserRank } from "@/lib/users";
import { isRankCode } from "@/lib/ranks";
import { createWelcomeChannel } from "@/lib/chat";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const session = await getFreshSession();
  if (!session?.isStaff) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { userId } = await params;
  const body = await request.json().catch(() => null);

  // rank: null retire l'officier de l'effectif (radiation) sans supprimer son compte.
  if (body?.rank !== null && !isRankCode(body?.rank)) {
    return NextResponse.json({ error: "Grade invalide" }, { status: 400 });
  }

  const target = await getUserById(userId);
  if (!target) {
    return NextResponse.json({ error: "Compte introuvable" }, { status: 404 });
  }

  const characterName = typeof body.characterName === "string" ? body.characterName : undefined;
  await updateUserRank(
    userId,
    body.rank,
    characterName,
    typeof body.badgeNumber === "string" ? body.badgeNumber : undefined
  );

  // Premier grade attribué à ce compte : ouvre son salon d'accueil.
  if (target.rank === null && body.rank !== null) {
    await createWelcomeChannel(userId, characterName || target.characterName || target.username);
  }

  return NextResponse.json({ ok: true });
}
