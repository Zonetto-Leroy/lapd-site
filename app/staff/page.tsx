import { redirect } from "next/navigation";
import { getFreshSession } from "@/lib/auth";
import { listCandidatures } from "@/lib/candidatures";
import { listOfficers } from "@/lib/users";
import { rankIndex } from "@/lib/ranks";
import CandidatureActions from "./CandidatureActions";
import RankControl from "./RankControl";

export default async function StaffPage() {
  const session = await getFreshSession();
  if (!session) redirect("/connexion");

  if (!session.isStaff) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-3xl font-semibold uppercase tracking-wide">Accès réservé</h1>
        <p className="mt-4 text-foreground-muted">Cette section est réservée au staff du LAPD.</p>
      </div>
    );
  }

  const [candidatures, officers] = await Promise.all([listCandidatures(), listOfficers()]);
  const pending = candidatures.filter((c) => c.status === "pending");
  const decided = candidatures.filter((c) => c.status !== "pending").slice(0, 10);
  const sortedOfficers = [...officers].sort((a, b) => rankIndex(b.rank!) - rankIndex(a.rank!));

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="mb-10">
        <span className="inline-flex items-center rounded-full border border-lapd-gold/50 bg-lapd-gold/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-lapd-gold">
          Staff LAPD
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold uppercase tracking-wide">Espace staff</h1>
      </div>

      <section className="mb-10">
        <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
          Candidatures en attente ({pending.length})
        </h2>
        {pending.length > 0 ? (
          <div className="mt-4 space-y-3">
            {pending.map((c) => (
              <div key={c.id} className="rounded-xl border border-border bg-background-elevated p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{c.characterName}</p>
                    <p className="text-xs text-foreground-muted">
                      Compte : {c.username} · Âge : {c.characterAge || "non précisé"}
                    </p>
                  </div>
                  <CandidatureActions id={c.id} />
                </div>
                {c.experience && <p className="mt-3 text-sm text-foreground-muted">Expérience : {c.experience}</p>}
                <p className="mt-2 text-sm">{c.motivation}</p>
                {c.availability && (
                  <p className="mt-2 text-xs text-foreground-muted">Disponibilités : {c.availability}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-foreground-muted">Aucune candidature en attente.</p>
        )}
      </section>

      <section className="mb-10">
        <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
          Effectif ({sortedOfficers.length})
        </h2>
        {sortedOfficers.length > 0 ? (
          <div className="mt-4 space-y-2">
            {sortedOfficers.map((o) => (
              <div
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background-elevated p-4"
              >
                <div>
                  <p className="text-sm font-semibold">{o.characterName || o.username}</p>
                  <p className="text-xs text-foreground-muted">Compte : {o.username}</p>
                </div>
                <RankControl userId={o.id} rank={o.rank!} />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-foreground-muted">Aucun officier enregistré pour le moment.</p>
        )}
      </section>

      {decided.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide">Historique récent</h2>
          <div className="mt-4 space-y-2">
            {decided.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-border bg-background-elevated p-4 text-sm"
              >
                <span>
                  {c.characterName} ({c.username})
                </span>
                <span className={c.status === "accepted" ? "text-lapd-success" : "text-lapd-danger"}>
                  {c.status === "accepted" ? "Acceptée" : "Refusée"} par {c.decidedBy}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
