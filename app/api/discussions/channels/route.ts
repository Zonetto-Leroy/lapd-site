import { NextResponse } from "next/server";
import { getFreshSession, isOfficer } from "@/lib/auth";
import { listChannels, createChannel } from "@/lib/chat";

export async function GET() {
  const session = await getFreshSession();
  if (!session || !isOfficer(session)) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const channels = await listChannels({ userId: session.userId, isStaff: session.isStaff });
  return NextResponse.json({ channels });
}

export async function POST(request: Request) {
  const session = await getFreshSession();
  if (!isOfficer(session)) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (!body?.name) return NextResponse.json({ error: "Nom manquant" }, { status: 400 });

  const channel = await createChannel(body.name);
  if (!channel) {
    return NextResponse.json({ error: "Impossible de créer le salon" }, { status: 503 });
  }
  return NextResponse.json({ channel });
}
