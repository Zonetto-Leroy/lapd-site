import { redirect } from "next/navigation";
import { RefreshCw, LogOut } from "lucide-react";
import { getSession } from "@/lib/auth";

export default async function ProfilPage() {
  const session = await getSession();
  if (!session) redirect("/api/auth/discord/login");

  const visibleRoles = session.roles.filter((role) => /[a-zA-Z0-9]/.test(role.name));

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-border bg-background-elevated p-8">
        <div className="flex items-center gap-4">
          {session.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.avatarUrl} alt="" className="h-16 w-16 rounded-full" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-lapd-primary" />
          )}
          <div>
            <h1 className="font-display text-2xl font-semibold">{session.displayName}</h1>
            <p className="text-sm text-foreground-muted">
              {session.username} • ID Discord : {session.discordId}
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6">
          {!session.isMember && (
            <p className="rounded-lg border border-lapd-danger/40 bg-lapd-danger/10 px-4 py-3 text-sm text-lapd-danger">
              Tu n&apos;es pas (encore) membre du serveur Discord LAPD.
            </p>
          )}

          {session.isMember && session.topRole && (
            <>
              <p className="text-sm uppercase tracking-wide text-foreground-muted">Grade actuel</p>
              <p className="mt-1 font-display text-3xl font-bold" style={{ color: session.topRole.color }}>
                {session.topRole.name}
              </p>
            </>
          )}

          {session.isMember && !session.topRole && (
            <p className="text-foreground-muted">
              Tu es membre du serveur, mais aucun rôle particulier ne t&apos;est encore attribué.
            </p>
          )}

          {session.isMember && visibleRoles.length > 0 && (
            <div className="mt-6">
              <p className="text-sm uppercase tracking-wide text-foreground-muted">Tous tes rôles</p>
              <div className="mt-3 space-y-1.5">
                {visibleRoles.map((role) => (
                  <div key={role.id} className="flex items-center gap-2.5 text-sm">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: role.color }} />
                    <span style={{ color: role.color }}>{role.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-5">
          <a
            href="/api/auth/discord/login"
            className="flex items-center gap-1.5 text-sm text-foreground-muted underline underline-offset-4 hover:text-foreground"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Rafraîchir les rôles
          </a>
          <a
            href="/api/auth/logout"
            className="flex items-center gap-1.5 text-sm text-foreground-muted underline underline-offset-4 hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" /> Se déconnecter
          </a>
        </div>
      </div>
    </div>
  );
}
