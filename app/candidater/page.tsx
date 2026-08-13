import Link from "next/link";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getCandidatureByUser } from "@/lib/candidatures";
import RecruitmentForm from "./RecruitmentForm";

export default async function CandidaterPage() {
  const session = await getSession();
  const candidature = session ? await getCandidatureByUser(session.userId) : null;

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
          l&apos;examinera dans l&apos;espace staff.
        </p>
      </div>

      {!session ? (
        <div className="rounded-xl border border-border bg-background-elevated p-8 text-center">
          <p className="text-foreground-muted">Connecte-toi pour soumettre ta candidature.</p>
          <Link
            href="/connexion"
            className="mt-4 inline-block rounded-full bg-lapd-primary px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Se connecter
          </Link>
        </div>
      ) : candidature?.status === "pending" ? (
        <div className="flex items-center gap-3 rounded-xl border border-lapd-gold/40 bg-lapd-gold/10 p-6 text-lapd-gold">
          <Clock className="h-6 w-6 shrink-0" />
          <p className="text-sm">Ta candidature est en attente d&apos;examen par l&apos;équipe du LAPD.</p>
        </div>
      ) : candidature?.status === "accepted" ? (
        <div className="flex items-center gap-3 rounded-xl border border-lapd-success/40 bg-lapd-success/10 p-6 text-lapd-success">
          <CheckCircle2 className="h-6 w-6 shrink-0" />
          <p className="text-sm">
            Ta candidature a été acceptée — bienvenue au LAPD ! Retrouve-toi dans{" "}
            <Link href="/effectif" className="underline underline-offset-4">
              l&apos;effectif
            </Link>
            .
          </p>
        </div>
      ) : (
        <>
          {candidature?.status === "refused" && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-lapd-danger/40 bg-lapd-danger/10 p-6 text-lapd-danger">
              <XCircle className="h-6 w-6 shrink-0" />
              <p className="text-sm">
                Ta précédente candidature n&apos;a pas été retenue. Tu peux en soumettre une nouvelle.
              </p>
            </div>
          )}
          <RecruitmentForm />
        </>
      )}
    </div>
  );
}
