"use client";

import { useState, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { REPORT_TEMPLATE_URL } from "@/lib/reports";

export default function RapportForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);
    const file = data.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setError("Merci de sélectionner un fichier.");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/rapports", { method: "POST", body: data });

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
        Déposer un rapport
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-background-elevated p-5">
      <p className="text-sm text-foreground-muted">
        Rédige ton rapport à partir du{" "}
        <a
          href={REPORT_TEMPLATE_URL}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-lapd-gold underline underline-offset-2"
        >
          modèle officiel
        </a>
        , puis dépose le fichier final ici.
      </p>

      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
          Titre (optionnel)
        </label>
        <input
          id="title"
          name="title"
          type="text"
          maxLength={150}
          placeholder="Ex : Arrestation — 12/08/2026"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-lapd-gold"
        />
      </div>

      <div>
        <label htmlFor="file" className="mb-1.5 block text-sm font-medium">
          Fichier du rapport
        </label>
        <input
          ref={fileInputRef}
          id="file"
          name="file"
          type="file"
          required
          accept=".pdf,.doc,.docx,.odt,.txt"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none file:mr-3 file:rounded-full file:border-0 file:bg-lapd-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
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
