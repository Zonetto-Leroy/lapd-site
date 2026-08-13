import { NextResponse } from "next/server";
import { getFreshSession, isOfficer } from "@/lib/auth";
import { canAccessChannel, getChannel, getMessages, postMessage } from "@/lib/chat";

export async function GET(request: Request) {
  const session = await getFreshSession();
  if (!session || !isOfficer(session)) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get("channelId");
  if (!channelId) return NextResponse.json({ error: "channelId manquant" }, { status: 400 });

  const channel = await getChannel(channelId);
  if (!channel || !canAccessChannel(channel, session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const messages = await getMessages(channelId);
  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  const session = await getFreshSession();
  if (!session || !isOfficer(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.channelId || !body?.content) {
    return NextResponse.json({ error: "channelId ou content manquant" }, { status: 400 });
  }

  const channel = await getChannel(body.channelId);
  if (!channel || !canAccessChannel(channel, session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const message = await postMessage({
    channelId: body.channelId,
    authorId: session.userId,
    authorName: session.username,
    content: body.content,
  });
  if (!message) {
    return NextResponse.json({ error: "Message vide ou messagerie non configurée" }, { status: 503 });
  }
  return NextResponse.json({ message });
}
