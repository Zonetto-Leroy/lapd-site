import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import logo from "@/public/logo.png";

export default async function Header() {
  const session = await getSession();

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/reglement", label: "Règlement" },
    { href: "/grades", label: "Grades" },
    { href: "/candidater", label: "Candidater" },
    { href: "/effectif", label: "Effectif" },
    ...(session?.isStaff ? [{ href: "/staff", label: "Staff" }] : []),
  ];

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
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

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
