"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserX } from "lucide-react";
import { RANKS, type RankCode } from "@/lib/ranks";

export default function RankControl({ userId, rank }: { userId: string; rank: RankCode }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function changeRank(newRank: RankCode) {
    setSubmitting(true);
    await fetch(`/api/staff/effectif/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rank: newRank }),
    });
    setSubmitting(false);
    router.refresh();
  }

  async function remove() {
    if (!window.confirm("Radier cet officier de l'effectif ?")) return;
    setSubmitting(true);
    await fetch(`/api/staff/effectif/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rank: null }),
    });
    setSubmitting(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={rank}
        disabled={submitting}
        onChange={(e) => changeRank(e.target.value as RankCode)}
        className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs outline-none focus:border-lapd-gold disabled:opacity-50"
      >
        {RANKS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <button
        onClick={remove}
        disabled={submitting}
        aria-label="Radier"
        title="Radier de l'effectif"
        className="rounded-lg p-1.5 text-foreground-muted transition-colors hover:bg-lapd-danger/10 hover:text-lapd-danger disabled:opacity-50"
      >
        <UserX className="h-4 w-4" />
      </button>
    </div>
  );
}
