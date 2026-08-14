import { redirect } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";
import { getFreshSession } from "@/lib/auth";

export default async function ProfilPage() {
  const session = await getFreshSession();
  if (!session) redirect("/connexion");

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-border bg-background-elevated p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-lapd-primary text-xl font-bold text-white">
            {session.username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold">{session.username}</h1>
            {session.isStaff && (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-lapd-gold/10 px-2.5 py-0.5 text-xs font-semibold text-lapd-gold">
                <ShieldCheck className="h-3.5 w-3.5" /> Staff
              </span>
            )}
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6">
          {session.rank ? (
            <>
              <p className="text-sm uppercase tracking-wide text-foreground-muted">Grade actuel</p>
              <p className="mt-1 font-display text-3xl font-bold text-lapd-primary">{session.rank}</p>
            </>
          ) : (
            <p className="text-foreground-muted">
              Tu n&apos;es pas encore membre du LAPD. Le recrutement se fait sur le site principal CLK ; une
              fois accepté, le staff t&apos;intègre à l&apos;effectif depuis cet espace.
            </p>
          )}
        </div>

        <div className="mt-8">
          <a
            href="/api/auth/logout"
            className="flex w-fit items-center gap-1.5 text-sm text-foreground-muted underline underline-offset-4 hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" /> Se déconnecter
          </a>
        </div>
      </div>
    </div>
  );
}
