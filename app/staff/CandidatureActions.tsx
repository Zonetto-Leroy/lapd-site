"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

export default function CandidatureActions({ id }: { id: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function decide(action: "accept" | "refuse") {
    setSubmitting(true);
    await fetch(`/api/staff/candidatures/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setSubmitting(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => decide("accept")}
        disabled={submitting}
        className="flex items-center gap-1.5 rounded-full bg-lapd-success px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <Check className="h-3.5 w-3.5" /> Accepter
      </button>
      <button
        onClick={() => decide("refuse")}
        disabled={submitting}
        className="flex items-center gap-1.5 rounded-full border border-lapd-danger/50 px-4 py-1.5 text-xs font-semibold text-lapd-danger transition-colors hover:bg-lapd-danger/10 disabled:opacity-50"
      >
        <X className="h-3.5 w-3.5" /> Refuser
      </button>
    </div>
  );
}
