"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [staffKey, setStaffKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, staffKey: staffKey || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Impossible de créer le compte.");
        return;
      }
      router.push("/profil");
      router.refresh();
    } catch {
      setError("Erreur réseau.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="username" className="mb-1.5 block text-sm font-medium">
          Nom d&apos;utilisateur
        </label>
        <input
          id="username"
          type="text"
          required
          minLength={3}
          maxLength={24}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-lg border border-border bg-background-elevated px-3 py-2 text-sm outline-none focus:border-lapd-gold"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-border bg-background-elevated px-3 py-2 text-sm outline-none focus:border-lapd-gold"
        />
      </div>

      <div>
        <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium">
          Confirmer le mot de passe
        </label>
        <input
          id="confirm"
          type="password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full rounded-lg border border-border bg-background-elevated px-3 py-2 text-sm outline-none focus:border-lapd-gold"
        />
      </div>

      <div>
        <label htmlFor="staffKey" className="mb-1.5 block text-sm font-medium">
          Code d&apos;accès staff (optionnel)
        </label>
        <input
          id="staffKey"
          type="password"
          value={staffKey}
          onChange={(e) => setStaffKey(e.target.value)}
          placeholder="Laisse vide si tu n'es pas staff"
          className="w-full rounded-lg border border-border bg-background-elevated px-3 py-2 text-sm outline-none placeholder:text-foreground-muted focus:border-lapd-gold"
        />
      </div>

      {error && <p className="text-sm text-lapd-danger">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-lapd-primary px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? "Création…" : "Créer mon compte"}
      </button>
    </form>
  );
}
