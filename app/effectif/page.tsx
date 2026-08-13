import { listOfficers } from "@/lib/users";
import { RANKS } from "@/lib/ranks";

export default async function EffectifPage() {
  const officers = await listOfficers();

  const groups = [...RANKS]
    .reverse()
    .map((rank) => ({
      rank,
      members: officers.filter((o) => o.rank === rank),
    }))
    .filter((g) => g.members.length > 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl font-semibold uppercase tracking-wide">Effectif LAPD</h1>
        <p className="mt-2 text-foreground-muted">Les officiers actuels du département, du plus haut grade au plus bas.</p>
      </div>

      {groups.length > 0 ? (
        <div className="space-y-6">
          {groups.map(({ rank, members }) => (
            <div key={rank}>
              <h2 className="mb-2 border-b border-lapd-gold/40 pb-1 font-display text-sm font-semibold uppercase tracking-widest text-lapd-gold">
                {rank} ({members.length})
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-background-elevated px-4 py-3"
                  >
                    <span className="text-sm font-medium">{m.characterName || m.username}</span>
                    {m.badgeNumber && <span className="text-xs text-foreground-muted">#{m.badgeNumber}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-foreground-muted">Aucun officier enregistré pour le moment.</p>
      )}
    </div>
  );
}
