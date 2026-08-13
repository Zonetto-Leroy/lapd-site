"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Status = "idle" | "submitting" | "success" | "error";

export default function RecruitmentForm() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);

    const res = await fetch("/api/recrutement/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        characterName: data.get("characterName"),
        characterAge: data.get("characterAge"),
        experience: data.get("experience"),
        motivation: data.get("motivation"),
        availability: data.get("availability"),
      }),
    });

    if (res.ok) {
      setStatus("success");
      form.reset();
      router.refresh();
    } else {
      const body = await res.json().catch(() => null);
      setError(body?.error === "already_applied" ? "Tu as déjà une candidature en cours." : "Une erreur est survenue.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-lapd-success/40 bg-lapd-success/10 p-6 text-center text-sm text-lapd-success">
        Ta candidature a bien été envoyée. L&apos;équipe du LAPD l&apos;examinera prochainement.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="characterName" className="mb-1.5 block text-sm font-medium">
          Nom du personnage
        </label>
        <input
          id="characterName"
          name="characterName"
          type="text"
          required
          maxLength={100}
          className="w-full rounded-lg border border-border bg-background-elevated px-3 py-2 text-sm outline-none focus:border-lapd-gold"
        />
      </div>

      <div>
        <label htmlFor="characterAge" className="mb-1.5 block text-sm font-medium">
          Âge du personnage
        </label>
        <input
          id="characterAge"
          name="characterAge"
          type="text"
          maxLength={20}
          className="w-full rounded-lg border border-border bg-background-elevated px-3 py-2 text-sm outline-none focus:border-lapd-gold"
        />
      </div>

      <div>
        <label htmlFor="experience" className="mb-1.5 block text-sm font-medium">
          Expérience RP antérieure
        </label>
        <textarea
          id="experience"
          name="experience"
          rows={3}
          maxLength={1000}
          className="w-full rounded-lg border border-border bg-background-elevated px-3 py-2 text-sm outline-none focus:border-lapd-gold"
        />
      </div>

      <div>
        <label htmlFor="motivation" className="mb-1.5 block text-sm font-medium">
          Motivation
        </label>
        <textarea
          id="motivation"
          name="motivation"
          required
          rows={4}
          maxLength={1000}
          className="w-full rounded-lg border border-border bg-background-elevated px-3 py-2 text-sm outline-none focus:border-lapd-gold"
        />
      </div>

      <div>
        <label htmlFor="availability" className="mb-1.5 block text-sm font-medium">
          Disponibilités
        </label>
        <input
          id="availability"
          name="availability"
          type="text"
          maxLength={200}
          placeholder="Ex : soirs de semaine, week-ends…"
          className="w-full rounded-lg border border-border bg-background-elevated px-3 py-2 text-sm outline-none placeholder:text-foreground-muted focus:border-lapd-gold"
        />
      </div>

      {error && <p className="text-sm text-lapd-danger">{error}</p>}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-lapd-primary px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {status === "submitting" ? "Envoi…" : "Envoyer ma candidature"}
      </button>
    </form>
  );
}
