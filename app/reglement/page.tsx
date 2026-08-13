import type { ComponentType } from "react";
import {
  Handshake,
  ShieldAlert,
  Radio,
  Shirt,
  Scale,
  Siren,
  Building2,
  AlertTriangle,
} from "lucide-react";

type Rule = { icon: ComponentType<{ className?: string; strokeWidth?: number }>; title: string; desc: string };

const RULES: Rule[] = [
  {
    icon: Handshake,
    title: "Respect et professionnalisme",
    desc: "Tout officier représente le LAPD à chaque instant, en service comme hors service. Le respect du public, des collègues et de la chaîne de commandement est non négociable.",
  },
  {
    icon: Building2,
    title: "Chaîne de commandement",
    desc: "Les ordres d'un supérieur hiérarchique doivent être exécutés, sauf s'ils sont manifestement illégaux. Tout désaccord se règle en privé, jamais devant des civils ou sur le réseau radio.",
  },
  {
    icon: ShieldAlert,
    title: "Usage de la force",
    desc: "La force doit rester proportionnée à la menace. L'escalade progressive (sommation, contrôle physique, arme non létale, arme létale) est la règle, sauf danger de mort immédiat.",
  },
  {
    icon: Radio,
    title: "Discipline radio",
    desc: "Le réseau radio est réservé aux communications de service. Codes et phraséologie standard sont attendus une fois formé ; pas de bavardage inutile sur le canal principal.",
  },
  {
    icon: Shirt,
    title: "Tenue et équipement",
    desc: "L'uniforme réglementaire du grade est obligatoire en service, propre et complet. L'équipement doit être vérifié en début de prise de service.",
  },
  {
    icon: Scale,
    title: "Intégrité",
    desc: "Falsifier un rapport, abuser de son autorité ou couvrir la faute d'un collègue expose à des sanctions disciplinaires pouvant aller jusqu'à la radiation.",
  },
  {
    icon: Siren,
    title: "Interventions",
    desc: "Toute intervention significative (interpellation, usage d'arme, poursuite) doit être signalée à la hiérarchie et documentée dès que possible.",
  },
  {
    icon: AlertTriangle,
    title: "Sanctions",
    desc: "Le non-respect de ce règlement entraîne un avertissement, une suspension temporaire ou une radiation définitive selon la gravité, décidée par le staff.",
  },
];

export default function ReglementPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="mb-12 text-center">
        <span className="inline-flex items-center rounded-full border border-lapd-gold/50 bg-lapd-gold/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-lapd-gold">
          Code de conduite
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold uppercase tracking-wide">Règlement</h1>
        <p className="mx-auto mt-3 max-w-xl text-foreground-muted">
          Les règles de conduite attendues de tout officier du Los Angeles Police Department.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {RULES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-xl border border-border bg-background-elevated p-6">
            <Icon className="h-6 w-6 text-lapd-gold" strokeWidth={1.75} />
            <h2 className="mt-3 font-display text-base font-semibold uppercase tracking-wide">{title}</h2>
            <p className="mt-2 text-sm text-foreground-muted">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
