import { fetchRosterMembers } from "@/lib/discord";
import { getSession, isLapdMember } from "@/lib/auth";

export default async function MembresPage() {
  const [members, session] = await Promise.all([fetchRosterMembers(), getSession()]);
  const isMember = isLapdMember(session);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-semibold uppercase tracking-wide">Annuaire LAPD</h1>
        <p className="mt-2 text-foreground-muted">Les membres actuels du département.</p>
      </div>

      {!session ? (
        <div className="rounded-xl border border-border bg-background-elevated p-8 text-center">
          <p className="text-foreground-muted">Connecte-toi avec Discord pour voir l&apos;annuaire complet.</p>
          <a
            href="/api/auth/discord/login"
            className="mt-4 inline-block rounded-full bg-lapd-primary px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Se connecter avec Discord
          </a>
        </div>
      ) : !isMember ? (
        <p className="text-center text-sm text-foreground-muted">
          Cet annuaire est réservé aux membres recrutés du LAPD.
        </p>
      ) : members.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-background-elevated p-4"
            >
              {m.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.avatarUrl} alt="" className="h-10 w-10 shrink-0 rounded-full" />
              ) : (
                <span className="h-10 w-10 shrink-0 rounded-full bg-lapd-primary" />
              )}
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{m.displayName}</div>
                {m.topRole && (
                  <div className="text-xs" style={{ color: `#${m.topRole.color.toString(16).padStart(6, "0")}` }}>
                    {m.topRole.name}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-foreground-muted">
          Impossible de récupérer l&apos;annuaire pour le moment.
        </p>
      )}
    </div>
  );
}
