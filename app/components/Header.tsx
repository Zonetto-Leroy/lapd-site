import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import logo from "@/public/logo.png";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/candidater", label: "Candidater" },
  { href: "/membres", label: "Membres" },
];

export default async function Header() {
  const session = await getSession();

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

        <nav className="hidden items-center gap-6 text-sm font-medium text-foreground-muted sm:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        {session ? (
          <Link
            href="/profil"
            className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 text-sm font-medium transition-colors hover:border-lapd-gold"
          >
            {session.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.avatarUrl} alt="" className="h-7 w-7 rounded-full" />
            ) : (
              <span className="h-7 w-7 rounded-full bg-lapd-primary" />
            )}
            {session.displayName}
          </Link>
        ) : (
          <Link
            href="/api/auth/discord/login"
            className="rounded-full bg-lapd-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Se connecter avec Discord
          </Link>
        )}
      </div>
    </header>
  );
}
