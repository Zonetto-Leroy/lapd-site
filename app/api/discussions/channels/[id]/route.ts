import { NextResponse } from "next/server";
import { getFreshSession } from "@/lib/auth";
import { deleteChannel } from "@/lib/chat";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getFreshSession();
  if (!session?.isStaff) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  await deleteChannel(id);
  return NextResponse.json({ ok: true });
}
