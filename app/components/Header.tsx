import Image from "next/image";
import Link from "next/link";
import { getFreshSession } from "@/lib/auth";
import { getCandidatureByUser } from "@/lib/candidatures";
import logo from "@/public/logo.png";
import PublicNav from "./PublicNav";

export default async function Header() {
  const session = await getFreshSession();
  const candidature = session ? await getCandidatureByUser(session.userId) : null;
  // Une fois candidaté (en attente ou accepté), plus besoin de voir l'onglet — sauf en cas de refus,
  // où il doit pouvoir re-candidater.
  const showCandidater = !session || !candidature || candidature.status === "refused";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={logo}
            alt="Los Angeles Police Department"
            width={40}
            height={40}
            className="rounded-full ring-1 ring-border"
            priority
          />
          <span className="font-display text-lg font-semibold uppercase tracking-wide">LAPD</span>
        </Link>

        <PublicNav
          showCandidater={showCandidater}
          hasRank={Boolean(session?.rank)}
          isStaffMember={Boolean(session?.isStaff)}
        />

        {session ? (
          <Link
            href="/profil"
            className="flex items-center gap-2 rounded-full border border-border py-1.5 pl-3 pr-3 text-sm font-medium transition-colors hover:border-lapd-gold"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-lapd-primary text-[10px] font-bold text-white">
              {session.username.slice(0, 2).toUpperCase()}
            </div>
            {session.username}
          </Link>
        ) : (
          <Link
            href="/connexion"
            className="rounded-full bg-lapd-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Se connecter
          </Link>
        )}
      </div>
    </header>
  );
}
