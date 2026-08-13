import Link from "next/link";
import { Users, Radio, Rocket, UserPlus, ShieldCheck } from "lucide-react";
import { fetchGuildStats } from "@/lib/discord";

export default async function Home() {
  const stats = await fetchGuildStats().catch(() => null);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border bg-lapd-primary">
        <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
          <span className="inline-flex items-center rounded-full border border-lapd-gold/50 bg-lapd-gold/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-lapd-gold">
            To Protect and to Serve
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold uppercase tracking-wide text-white sm:text-6xl">
            Los Angeles Police Department
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Patrouilles urbaines, maintien de l&apos;ordre et interventions au sein de la ville de
            Los Angeles.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/candidater"
              className="flex items-center gap-2 rounded-full bg-lapd-gold px-6 py-3 text-sm font-semibold text-lapd-primary transition-opacity hover:opacity-90"
            >
              <UserPlus className="h-4 w-4" /> Candidater
            </Link>
            <Link
              href="/membres"
              className="flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white"
            >
              <ShieldCheck className="h-4 w-4" /> Annuaire des membres
            </Link>
          </div>
        </div>
      </section>

      {stats && (
        <section className="mx-auto grid max-w-4xl grid-cols-3 gap-4 px-4 py-10 sm:px-6">
          <div className="rounded-xl border border-border bg-background-elevated p-5 text-center">
            <Users className="mx-auto h-5 w-5 text-foreground-muted" />
            <div className="mt-2 text-2xl font-bold">{stats.memberCount.toLocaleString("fr-FR")}</div>
            <div className="text-xs text-foreground-muted">Membres</div>
          </div>
          <div className="rounded-xl border border-border bg-background-elevated p-5 text-center">
            <Radio className="mx-auto h-5 w-5 text-lapd-success" />
            <div className="mt-2 text-2xl font-bold">{stats.onlineCount.toLocaleString("fr-FR")}</div>
            <div className="text-xs text-foreground-muted">En ligne</div>
          </div>
          <div className="rounded-xl border border-border bg-background-elevated p-5 text-center">
            <Rocket className="mx-auto h-5 w-5 text-foreground-muted" />
            <div className="mt-2 text-2xl font-bold">{stats.boostCount.toLocaleString("fr-FR")}</div>
            <div className="text-xs text-foreground-muted">Boosts</div>
          </div>
        </section>
      )}
    </div>
  );
}
