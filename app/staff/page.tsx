import { redirect } from "next/navigation";
import { getFreshSession } from "@/lib/auth";
import { listAllUsers, listOfficers } from "@/lib/users";
import { rankIndex } from "@/lib/ranks";
import RankControl from "./RankControl";
import PromoteControl from "./PromoteControl";

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

  const [officers, allUsers] = await Promise.all([listOfficers(), listAllUsers()]);
  const sortedOfficers = [...officers].sort((a, b) => rankIndex(b.rank!) - rankIndex(a.rank!));
  const unranked = allUsers.filter((u) => u.rank === null);

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

      <section>
        <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
          Comptes sans grade ({unranked.length})
        </h2>
        <p className="mt-1 text-xs text-foreground-muted">
          Recrues acceptées via le recrutement CLK (Discord) qui se sont créé un compte ici — intègre-les à
          l&apos;effectif pour leur donner accès aux outils internes.
        </p>
        {unranked.length > 0 ? (
          <div className="mt-4 space-y-2">
            {unranked.map((u) => (
              <div
                key={u.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background-elevated p-4"
              >
                <div>
                  <p className="text-sm font-semibold">{u.username}</p>
                  <p className="text-xs text-foreground-muted">
                    Inscrit le {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <PromoteControl userId={u.id} />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-foreground-muted">Aucun compte en attente d&apos;intégration.</p>
        )}
      </section>
    </div>
  );
}
