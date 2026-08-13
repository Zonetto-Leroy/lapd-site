"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { REPORT_TYPES } from "@/lib/reports";

export default function RapportForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    const res = await fetch("/api/rapports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: data.get("type"),
        title: data.get("title"),
        content: data.get("content"),
      }),
    });

    if (res.ok) {
      form.reset();
      setOpen(false);
      router.refresh();
    } else {
      const body = await res.json().catch(() => null);
      setError(body?.error || "Impossible d'envoyer le rapport.");
    }
    setSubmitting(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-lapd-primary px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Nouveau rapport
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-background-elevated p-5">
      <div>
        <label htmlFor="type" className="mb-1.5 block text-sm font-medium">
          Type de rapport
        </label>
        <select
          id="type"
          name="type"
          required
          defaultValue=""
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-lapd-gold"
        >
          <option value="" disabled>
            Choisir un type
          </option>
          {REPORT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
          Titre
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={150}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-lapd-gold"
        />
      </div>

      <div>
        <label htmlFor="content" className="mb-1.5 block text-sm font-medium">
          Contenu
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={6}
          maxLength={5000}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-lapd-gold"
        />
      </div>

      {error && <p className="text-sm text-lapd-danger">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-lapd-primary px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Envoi…" : "Envoyer le rapport"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground-muted hover:text-foreground"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
