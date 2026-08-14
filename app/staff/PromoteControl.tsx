"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RANKS, STARTING_RANK, type RankCode } from "@/lib/ranks";

export default function PromoteControl({ userId }: { userId: string }) {
  const router = useRouter();
  const [rank, setRank] = useState<RankCode>(STARTING_RANK);
  const [submitting, setSubmitting] = useState(false);

  async function promote() {
    setSubmitting(true);
    await fetch(`/api/staff/effectif/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rank }),
    });
    setSubmitting(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={rank}
        disabled={submitting}
        onChange={(e) => setRank(e.target.value as RankCode)}
        className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs outline-none focus:border-lapd-gold disabled:opacity-50"
      >
        {RANKS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <button
        onClick={promote}
        disabled={submitting}
        className="rounded-full bg-lapd-primary px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        Intégrer à l&apos;effectif
      </button>
    </div>
  );
}
