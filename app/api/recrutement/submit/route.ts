import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createCandidature, getCandidatureByUser } from "@/lib/candidatures";
import { postChannelMessage } from "@/lib/discord";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const existing = await getCandidatureByUser(session.userId);
  if (existing && existing.status !== "refused") {
    return NextResponse.json({ error: "already_applied" }, { status: 409 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { characterName, characterAge, experience, motivation, availability } = body as Record<
    string,
    string | undefined
  >;

  if (!characterName?.trim() || !motivation?.trim()) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const candidature = await createCandidature({
    userId: session.userId,
    username: session.username,
    characterName: characterName.trim().slice(0, 100),
    characterAge: (characterAge || "").trim().slice(0, 20),
    experience: (experience || "").trim().slice(0, 1000),
    motivation: motivation.trim().slice(0, 1000),
    availability: (availability || "").trim().slice(0, 200),
  });

  if (!candidature) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const channelId = process.env.RECRUITMENT_APPLICATIONS_CHANNEL_ID;
  if (channelId) {
    await postChannelMessage(
      channelId,
      [
        {
          title: "Nouvelle candidature — LAPD",
          color: 0x0b2545,
          author: { name: candidature.username },
          fields: [
            { name: "Compte site LAPD", value: candidature.username, inline: true },
            { name: "Nom du personnage", value: candidature.characterName, inline: true },
            { name: "Âge du personnage", value: candidature.characterAge || "Non précisé", inline: true },
            { name: "Disponibilités", value: candidature.availability || "Non précisé" },
            { name: "Expérience RP", value: candidature.experience || "Aucune précisée" },
            { name: "Motivation", value: candidature.motivation },
          ],
          timestamp: candidature.createdAt,
        },
      ],
      [
        { label: "Accepter", customId: `lapd-recrutement-accept:${candidature.id}`, style: "success" },
        { label: "Refuser", customId: `lapd-recrutement-refuse:${candidature.id}`, style: "danger" },
      ]
    );
  }

  return NextResponse.json({ ok: true, candidature });
}
