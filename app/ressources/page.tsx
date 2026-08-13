import { redirect } from "next/navigation";
import { BookOpen, ExternalLink } from "lucide-react";
import { getFreshSession } from "@/lib/auth";

export default async function RessourcesPage() {
  const session = await getFreshSession();
  if (!session) redirect("/connexion");

  if (!session.rank) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-3xl font-semibold uppercase tracking-wide">Accès réservé</h1>
        <p className="mt-4 text-foreground-muted">
          Cette section est réservée aux membres du département. Pense à{" "}
          <a href="/candidater" className="text-lapd-gold underline underline-offset-4">
            candidater
          </a>{" "}
          si ce n&apos;est pas encore fait.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-10">
        <span className="inline-flex items-center rounded-full border border-lapd-gold/50 bg-lapd-gold/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-lapd-gold">
          Réservé au département
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold uppercase tracking-wide">Ressources</h1>
        <p className="mt-2 text-foreground-muted">Documents et outils internes réservés aux officiers du LAPD.</p>
      </div>

      <a
        href="https://docs.google.com/document/d/1A9HAjpMMoO7mfxN8BbjRhHM75wQ-pGlRfWPJfvpPDxs/edit?tab=t.0"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-4 rounded-xl border border-border bg-background-elevated p-5 transition-colors hover:border-lapd-gold"
      >
        <BookOpen className="h-8 w-8 shrink-0 text-lapd-gold" strokeWidth={1.5} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Manuel du LAPD</p>
          <p className="text-sm text-foreground-muted">Procédures, protocoles et références officielles du département.</p>
        </div>
        <ExternalLink className="h-4 w-4 shrink-0 text-foreground-muted" />
      </a>
    </div>
  );
}
