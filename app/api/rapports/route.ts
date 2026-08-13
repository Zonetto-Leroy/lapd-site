import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getFreshSession, isOfficer } from "@/lib/auth";
import { getUserById } from "@/lib/users";
import { listReports, createReport } from "@/lib/reports";

const MAX_SIZE_BYTES = 8 * 1024 * 1024;

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

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Stockage de fichiers non configuré" }, { status: 503 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Fichier trop volumineux (max 8 Mo)" }, { status: 400 });
  }

  const title = String(form.get("title") || "").trim().slice(0, 150) || file.name;

  const blob = await put(`rapports/${crypto.randomUUID()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: false,
  });

  const user = await getUserById(session.userId);

  const report = await createReport({
    authorId: session.userId,
    authorUsername: session.username,
    authorCharacterName: user?.characterName ?? null,
    title,
    fileUrl: blob.url,
    fileName: file.name,
    fileSize: file.size,
  });

  if (!report) {
    return NextResponse.json({ error: "Rapports non configurés (base de données manquante)" }, { status: 503 });
  }
  return NextResponse.json({ report });
}
