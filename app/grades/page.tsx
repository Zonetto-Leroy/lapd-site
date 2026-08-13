import { Star } from "lucide-react";
import { RANKS, type RankCode } from "@/lib/ranks";

const TIER_DESCRIPTIONS: Record<string, string> = {
  "Police Officer": "Officier de patrouille — intervention de première ligne et maintien de l'ordre au quotidien.",
  Detective: "Enquêteur — investigation, suivi de dossiers et travail d'enquête approfondi.",
  Sergeant: "Supervision d'équipe — encadrement direct des officiers en patrouille.",
  Lieutenant: "Commandement d'unité — coordination des opérations et gestion du personnel.",
  Captain: "Commandement de division — responsable de la stratégie et de la discipline du département.",
};

function tierOf(rank: RankCode): string {
  return rank.replace(/\s+(I{1,3})$/, "");
}

export default function GradesPage() {
  const ordered = [...RANKS].reverse();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="mb-12 text-center">
        <span className="inline-flex items-center rounded-full border border-lapd-gold/50 bg-lapd-gold/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-lapd-gold">
          Hiérarchie
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold uppercase tracking-wide">Grades du LAPD</h1>
        <p className="mx-auto mt-3 max-w-xl text-foreground-muted">
          Du grade d&apos;entrée jusqu&apos;au plafond de commandement sur ce serveur.
        </p>
      </div>

      <div className="relative space-y-3 border-l-2 border-lapd-gold/40 pl-6">
        {ordered.map((rank, i) => {
          const tier = tierOf(rank);
          const isNewTier = i === 0 || tierOf(ordered[i - 1]) !== tier;
          return (
            <div key={rank} className="relative">
              <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-lapd-gold bg-background">
                <Star className="h-2 w-2 fill-lapd-gold text-lapd-gold" />
              </span>
              <div className="rounded-xl border border-border bg-background-elevated p-4">
                <p className="font-display text-base font-semibold uppercase tracking-wide">{rank}</p>
                {isNewTier && TIER_DESCRIPTIONS[tier] && (
                  <p className="mt-1 text-sm text-foreground-muted">{TIER_DESCRIPTIONS[tier]}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
