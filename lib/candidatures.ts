import { getRedis } from "./redis";

const CANDIDATURES_KEY = "lapd:candidatures";

export type CandidatureStatus = "pending" | "accepted" | "refused";

export type Candidature = {
  id: string;
  userId: string;
  username: string;
  characterName: string;
  characterAge: string;
  experience: string;
  motivation: string;
  availability: string;
  status: CandidatureStatus;
  createdAt: string;
  decidedAt: string | null;
  decidedBy: string | null;
};

export async function listCandidatures(): Promise<Candidature[]> {
  const redis = getRedis();
  if (!redis) return [];
  const all = (await redis.hgetall<Record<string, Candidature>>(CANDIDATURES_KEY)) || {};
  return Object.values(all).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Dernière candidature d'un utilisateur (privilégie une candidature en attente s'il y en a une). */
export async function getCandidatureByUser(userId: string): Promise<Candidature | null> {
  const all = await listCandidatures();
  const mine = all.filter((c) => c.userId === userId);
  return mine.find((c) => c.status === "pending") ?? mine[0] ?? null;
}

export async function createCandidature(
  input: Omit<Candidature, "id" | "status" | "createdAt" | "decidedAt" | "decidedBy">
): Promise<Candidature | null> {
  const redis = getRedis();
  if (!redis) return null;

  const candidature: Candidature = {
    ...input,
    id: crypto.randomUUID(),
    status: "pending",
    createdAt: new Date().toISOString(),
    decidedAt: null,
    decidedBy: null,
  };
  await redis.hset(CANDIDATURES_KEY, { [candidature.id]: candidature });
  return candidature;
}

export async function decideCandidature(
  id: string,
  status: "accepted" | "refused",
  decidedBy: string
): Promise<Candidature | null> {
  const redis = getRedis();
  if (!redis) return null;

  const existing = await redis.hget<Candidature>(CANDIDATURES_KEY, id);
  if (!existing) return null;

  const updated: Candidature = { ...existing, status, decidedAt: new Date().toISOString(), decidedBy };
  await redis.hset(CANDIDATURES_KEY, { [id]: updated });
  return updated;
}
