import Link from "next/link";
import { Users, ShieldCheck, UserPlus } from "lucide-react";
import { listOfficers, listAllUsers } from "@/lib/users";

export default async function Home() {
  const [officers, users] = await Promise.all([listOfficers(), listAllUsers()]);

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
              href="/effectif"
              className="flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white"
            >
              <ShieldCheck className="h-4 w-4" /> Effectif
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-4xl grid-cols-2 gap-4 px-4 py-10 sm:px-6">
        <div className="rounded-xl border border-border bg-background-elevated p-5 text-center">
          <ShieldCheck className="mx-auto h-5 w-5 text-lapd-gold" />
          <div className="mt-2 text-2xl font-bold">{officers.length}</div>
          <div className="text-xs text-foreground-muted">Officiers en poste</div>
        </div>
        <div className="rounded-xl border border-border bg-background-elevated p-5 text-center">
          <Users className="mx-auto h-5 w-5 text-foreground-muted" />
          <div className="mt-2 text-2xl font-bold">{users.length}</div>
          <div className="text-xs text-foreground-muted">Comptes inscrits</div>
        </div>
      </section>
    </div>
  );
}
