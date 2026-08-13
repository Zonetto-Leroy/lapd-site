import { NextResponse } from "next/server";
import { getFreshSession, isOfficer } from "@/lib/auth";
import { getUserById } from "@/lib/users";
import { listReports, createReport, REPORT_TYPES, type ReportType } from "@/lib/reports";

export async function GET() {
  const session = await getFreshSession();
  if (!isOfficer(session)) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const reports = await listReports();
  return NextResponse.json({ reports });
}

export async function POST(request: Request) {
  const session = await getFreshSession();
  if (!session || !isOfficer(session)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const title = String(body?.title || "").trim();
  const content = String(body?.content || "").trim();
  const type = body?.type as ReportType;

  if (!title || !content) {
    return NextResponse.json({ error: "Titre et contenu requis" }, { status: 400 });
  }
  if (!REPORT_TYPES.includes(type)) {
    return NextResponse.json({ error: "Type de rapport invalide" }, { status: 400 });
  }

  const user = await getUserById(session.userId);

  const report = await createReport({
    authorId: session.userId,
    authorUsername: session.username,
    authorCharacterName: user?.characterName ?? null,
    type,
    title: title.slice(0, 150),
    content: content.slice(0, 5000),
  });

  if (!report) {
    return NextResponse.json({ error: "Rapports non configurés (base de données manquante)" }, { status: 503 });
  }
  return NextResponse.json({ report });
}
