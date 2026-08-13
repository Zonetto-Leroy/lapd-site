import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createCandidature, getCandidatureByUser } from "@/lib/candidatures";

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

  return NextResponse.json({ ok: true, candidature });
}
