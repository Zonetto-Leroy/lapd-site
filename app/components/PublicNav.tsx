"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { Menu, X, Home, ScrollText, ClipboardList, ShieldCheck, BookOpen, Users } from "lucide-react";

type NavItem = { href: string; label: string; icon: ComponentType<{ className?: string }> };
type NavCategory = { label: string; items: NavItem[] };

function buildCategories(showCandidater: boolean, hasRank: boolean, isStaffMember: boolean): NavCategory[] {
  const categories: NavCategory[] = [
    {
      label: "Département",
      items: [
        { href: "/", label: "Accueil", icon: Home },
        { href: "/reglement", label: "Règlement", icon: ScrollText },
      ],
    },
    {
      label: "Rejoindre",
      items: [
        ...(showCandidater ? [{ href: "/candidater", label: "Candidater", icon: ClipboardList }] : []),
        { href: "/effectif", label: "Effectif", icon: Users },
      ],
    },
  ];

  if (hasRank) {
    categories.push({
      label: "Membres",
      items: [{ href: "/ressources", label: "Ressources", icon: BookOpen }],
    });
  }

  if (isStaffMember) {
    categories.push({
      label: "Équipe",
      items: [{ href: "/staff", label: "Espace Staff", icon: ShieldCheck }],
    });
  }

  return categories;
}

export default function PublicNav({
  showCandidater,
  hasRank,
  isStaffMember,
}: {
  showCandidater: boolean;
  hasRank: boolean;
  isStaffMember: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Le header a un backdrop-blur, qui crée un "containing block" pour les
  // descendants position:fixed dans certains navigateurs — le menu se
  // retrouvait coincé dans les dimensions du bandeau du header au lieu de
  // couvrir tout l'écran. On échappe le tiroir via un portail dans <body>,
  // qui n'existe qu'une fois monté côté client.
  const [mounted] = useState(() => typeof document !== "undefined");
  const categories = buildCategories(showCandidater, hasRank, isStaffMember);

  const drawer = open && (
    <div className="fixed inset-0 z-[60] flex" onClick={() => setOpen(false)}>
      <div className="h-full w-72 overflow-y-auto bg-background p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <span className="font-display text-sm font-semibold uppercase tracking-wide">Menu</span>
          <button
            onClick={() => setOpen(false)}
            className="text-foreground-muted hover:text-foreground"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-6">
          {categories.map((category) => (
            <div key={category.label}>
              <h3 className="px-1 text-xs font-semibold uppercase tracking-wide text-foreground-muted">
                {category.label}
              </h3>
              <div className="mt-2 space-y-0.5">
                {category.items.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                        active
                          ? "bg-lapd-gold/10 font-medium text-lapd-gold"
                          : "text-foreground-muted hover:bg-background-elevated hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" /> {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
      <div className="flex-1 bg-black/50" />
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm font-medium text-foreground-muted transition-colors hover:text-foreground"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5" />
        <span className="hidden sm:inline">Menu</span>
      </button>

      {mounted && drawer && createPortal(drawer, document.body)}
    </>
  );
}
