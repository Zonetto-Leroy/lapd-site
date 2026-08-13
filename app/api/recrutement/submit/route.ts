import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { postChannelMessage } from "@/lib/discord";

const MAX_FIELD_LENGTH = 1000;

function truncate(value: string): string {
  return value.length > MAX_FIELD_LENGTH ? `${value.slice(0, MAX_FIELD_LENGTH)}…` : value;
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const channelId = process.env.RECRUITMENT_APPLICATIONS_CHANNEL_ID;
  if (!channelId) {
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
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

  const posted = await postChannelMessage(
    channelId,
    [
      {
        title: "Nouvelle candidature — LAPD",
        color: 0x0b2545,
        author: { name: session.username, icon_url: session.avatarUrl ?? undefined },
        fields: [
          { name: "Candidat Discord", value: `<@${session.discordId}>`, inline: true },
          { name: "Nom du personnage", value: truncate(characterName), inline: true },
          { name: "Âge du personnage", value: characterAge?.trim() ? truncate(characterAge) : "Non précisé", inline: true },
          { name: "Disponibilités", value: availability?.trim() ? truncate(availability) : "Non précisé" },
          { name: "Expérience RP", value: experience?.trim() ? truncate(experience) : "Aucune précisée" },
          { name: "Motivation", value: truncate(motivation) },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
    [
      { label: "Accepter", customId: `recrutement-accept:${session.discordId}`, style: "success" },
      { label: "Refuser", customId: "recrutement-refuse", style: "danger" },
    ]
  );

  if (!posted.ok) {
    return NextResponse.json({ error: "discord_error" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
