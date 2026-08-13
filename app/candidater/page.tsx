import Link from "next/link";
import { getSession } from "@/lib/auth";
import RecruitmentForm from "./RecruitmentForm";

export default async function CandidaterPage() {
  const session = await getSession();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center rounded-full border border-lapd-gold/50 bg-lapd-gold/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-lapd-gold">
          Rejoindre l&apos;équipe
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold uppercase tracking-wide">
          Candidater au LAPD
        </h1>
        <p className="mt-3 text-foreground-muted">
          Rejoins le Los Angeles Police Department. Remplis le formulaire ci-dessous, l&apos;équipe
          te recontactera sur Discord.
        </p>
      </div>

      {session ? (
        <RecruitmentForm />
      ) : (
        <div className="rounded-xl border border-border bg-background-elevated p-8 text-center">
          <p className="text-foreground-muted">Connecte-toi avec Discord pour soumettre ta candidature.</p>
          <Link
            href="/api/auth/discord/login"
            className="mt-4 inline-block rounded-full bg-lapd-primary px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Se connecter avec Discord
          </Link>
        </div>
      )}
    </div>
  );
}
