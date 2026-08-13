import { redirect } from "next/navigation";
import { FileText, Download } from "lucide-react";
import { getFreshSession, isOfficer } from "@/lib/auth";
import { listReports } from "@/lib/reports";
import RapportForm from "./RapportForm";

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export default async function RapportsPage() {
  const session = await getFreshSession();
  if (!session) redirect("/connexion");

  if (!isOfficer(session)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-3xl font-semibold uppercase tracking-wide">Accès réservé</h1>
        <p className="mt-4 text-foreground-muted">Cette section est réservée aux agents du LAPD.</p>
      </div>
    );
  }

  const reports = await listReports();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center rounded-full border border-lapd-gold/50 bg-lapd-gold/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-lapd-gold">
            Réservé au département
          </span>
          <h1 className="mt-4 font-display text-3xl font-semibold uppercase tracking-wide">Rapports</h1>
        </div>
        <RapportForm />
      </div>

      {reports.length > 0 ? (
        <div className="space-y-3">
          {reports.map((r) => (
            <a
              key={r.id}
              href={r.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background-elevated p-5 transition-colors hover:border-lapd-gold/50"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-lapd-gold" />
                  <span>
                    {r.authorCharacterName || r.authorUsername} ·{" "}
                    {new Date(r.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="mt-2 truncate font-semibold">{r.title}</p>
                <p className="mt-1 text-xs text-foreground-muted">
                  {r.fileName} · {formatFileSize(r.fileSize)}
                </p>
              </div>
              <Download className="h-5 w-5 shrink-0 text-foreground-muted" />
            </a>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-foreground-muted">Aucun rapport pour le moment.</p>
      )}
    </div>
  );
}
