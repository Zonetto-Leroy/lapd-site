"use client";

import { useEffect, useRef, useState } from "react";
import { Lock, Plus, Send, Trash2 } from "lucide-react";
import type { ChatChannel, ChatMessage } from "@/lib/chat";

export default function InternalChat({ isStaff }: { isStaff: boolean }) {
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [newChannelName, setNewChannelName] = useState("");
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/discussions/channels")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const list: ChatChannel[] = data.channels || [];
        setChannels(list);
        setActiveChannelId((current) => current ?? list[0]?.id ?? null);
      })
      .finally(() => {
        if (!cancelled) setLoadingChannels(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeChannelId) return;
    let cancelled = false;

    async function poll() {
      const res = await fetch(`/api/discussions/messages?channelId=${activeChannelId}`);
      if (!res.ok || cancelled) return;
      const data = await res.json();
      if (!cancelled) setMessages(data.messages || []);
    }

    poll();
    const interval = setInterval(poll, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [activeChannelId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const content = draft.trim();
    if (!content || !activeChannelId) return;
    setDraft("");
    setError(null);
    const res = await fetch("/api/discussions/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelId: activeChannelId, content }),
    });
    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Impossible d'envoyer le message.");
      setDraft(content);
    }
  };

  const createChannel = async () => {
    const name = newChannelName.trim();
    if (!name) return;
    setError(null);
    const res = await fetch("/api/discussions/channels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const data = await res.json();
      setChannels((prev) => [...prev, data.channel]);
      setActiveChannelId(data.channel.id);
      setNewChannelName("");
      setShowNewChannel(false);
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Impossible de créer le salon.");
    }
  };

  const removeChannel = async (id: string) => {
    if (!window.confirm("Supprimer ce salon et tous ses messages ?")) return;
    const remaining = channels.filter((c) => c.id !== id);
    setChannels(remaining);
    if (activeChannelId === id) setActiveChannelId(remaining[0]?.id ?? null);
    await fetch(`/api/discussions/channels/${id}`, { method: "DELETE" });
  };

  if (loadingChannels) {
    return (
      <div className="flex h-[60vh] items-center justify-center rounded-2xl border border-border">
        <p className="text-sm text-foreground-muted">Chargement…</p>
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2 rounded-2xl border border-border p-8 text-center">
        <p className="text-sm font-medium">Discussions non configurées</p>
        <p className="max-w-sm text-sm text-foreground-muted">
          La base de données nécessaire au stockage des salons et messages n&apos;est pas encore reliée au site.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[70vh] overflow-hidden rounded-2xl border border-border">
      <aside className="flex w-52 shrink-0 flex-col overflow-y-auto border-r border-border bg-background-elevated p-2">
        <div className="space-y-0.5">
          {channels.map((c) => (
            <div
              key={c.id}
              className={`group flex items-center rounded-lg text-sm transition-colors ${
                c.id === activeChannelId
                  ? "bg-lapd-gold/10 font-medium text-lapd-gold"
                  : "text-foreground-muted hover:bg-background hover:text-foreground"
              }`}
            >
              <button
                onClick={() => setActiveChannelId(c.id)}
                className="flex min-w-0 flex-1 items-center gap-1.5 truncate px-3 py-2 text-left"
              >
                {c.memberIds && c.memberIds.length > 0 && <Lock className="h-3 w-3 shrink-0 opacity-60" />}
                <span className="truncate">{c.name}</span>
              </button>
              {isStaff && (
                <button
                  onClick={() => removeChannel(c.id)}
                  className="mr-1 shrink-0 rounded-md p-1.5 opacity-0 hover:bg-lapd-danger/10 hover:text-lapd-danger group-hover:opacity-100"
                  aria-label={`Supprimer ${c.name}`}
                  title="Supprimer le salon"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-2 border-t border-border pt-2">
          {showNewChannel ? (
            <div className="flex items-center gap-1 px-1">
              <input
                autoFocus
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") createChannel();
                  if (e.key === "Escape") setShowNewChannel(false);
                }}
                placeholder="Nom du salon"
                className="w-full min-w-0 rounded-md border border-border bg-background px-2 py-1 text-xs outline-none focus:border-lapd-gold"
              />
              <button onClick={createChannel} className="shrink-0 rounded-md bg-lapd-primary px-2 py-1 text-xs font-semibold text-white">
                OK
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewChannel(true)}
              className="flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-foreground-muted hover:text-foreground"
            >
              <Plus className="h-4 w-4" /> Nouveau salon
            </button>
          )}
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m) => (
            <div key={m.id}>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium">{m.authorName}</span>
                <span className="text-xs text-foreground-muted">
                  {new Date(m.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="whitespace-pre-wrap break-words text-sm">{m.content}</p>
            </div>
          ))}
          {messages.length === 0 && (
            <p className="text-center text-sm text-foreground-muted">Aucun message pour l&apos;instant.</p>
          )}
          <div ref={bottomRef} />
        </div>

        {error && <p className="px-4 pb-1 text-xs text-lapd-danger">{error}</p>}

        <div className="flex gap-2 border-t border-border p-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            placeholder="Écrire un message…"
            className="flex-1 rounded-full border border-border bg-background-elevated px-4 py-2 text-sm outline-none placeholder:text-foreground-muted focus:border-lapd-gold"
          />
          <button
            onClick={send}
            className="flex items-center gap-1.5 rounded-full bg-lapd-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Send className="h-4 w-4" /> Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}
