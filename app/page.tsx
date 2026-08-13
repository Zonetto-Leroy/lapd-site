import Link from "next/link";
import { Users, ShieldCheck, UserPlus, Scale, Handshake, Siren, ScrollText, Star } from "lucide-react";
import { listOfficers, listAllUsers } from "@/lib/users";

const VALUES = [
  { icon: Scale, title: "Intégrité", desc: "Agir avec honnêteté, en toute transparence envers la hiérarchie et le public." },
  { icon: Handshake, title: "Service", desc: "Le public d'abord — protection, écoute et assistance à chaque intervention." },
  { icon: Siren, title: "Réactivité", desc: "Une réponse rapide et coordonnée face à toute situation d'urgence." },
  { icon: Star, title: "Excellence", desc: "Une formation continue et une exigence de professionnalisme à chaque grade." },
];

export default async function Home() {
  const [officers, users] = await Promise.all([listOfficers(), listAllUsers()]);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border bg-lapd-primary bg-fixed bg-cover bg-center" style={{ backgroundImage: "url(/hero-bg.png)" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-lapd-primary/90 via-lapd-primary/70 to-lapd-primary/95" />
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
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

      <section className="border-t border-border bg-background-elevated py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <span className="inline-flex items-center rounded-full border border-lapd-gold/50 bg-lapd-gold/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-lapd-gold">
            Notre mission
          </span>
          <p className="mx-auto mt-4 max-w-2xl font-display text-xl font-semibold uppercase tracking-wide text-lapd-primary sm:text-2xl">
            Protéger et servir la ville de Los Angeles avec intégrité et professionnalisme.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-border bg-background p-5 text-left">
                <Icon className="h-5 w-5 text-lapd-gold" strokeWidth={1.75} />
                <h3 className="mt-3 font-display text-sm font-semibold uppercase tracking-wide">{title}</h3>
                <p className="mt-1.5 text-xs text-foreground-muted">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/reglement"
              className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-lapd-gold"
            >
              <ScrollText className="h-4 w-4" /> Consulter le règlement
            </Link>
            <Link
              href="/grades"
              className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-lapd-gold"
            >
              <Star className="h-4 w-4" /> Voir la hiérarchie
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
