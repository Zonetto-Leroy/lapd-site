import { redirect } from "next/navigation";
import { getFreshSession, isOfficer } from "@/lib/auth";
import InternalChat from "./InternalChat";

export default async function DiscussionsPage() {
  const session = await getFreshSession();
  if (!session) redirect("/connexion");

  if (!isOfficer(session)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-3xl font-semibold uppercase tracking-wide">Accès réservé</h1>
        <p className="mt-4 text-foreground-muted">Cette section est réservée aux agents du LAPD.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="mb-8">
        <span className="inline-flex items-center rounded-full border border-lapd-gold/50 bg-lapd-gold/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-lapd-gold">
          Réservé au département
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold uppercase tracking-wide">Discussions</h1>
      </div>

      <InternalChat isStaff={session.isStaff} />
    </div>
  );
}
