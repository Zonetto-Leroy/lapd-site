import { getRedis } from "./redis";

const CHANNELS_KEY = "lapd:chat:channels";
const MESSAGES_KEY_PREFIX = "lapd:chat:messages:";
const MAX_MESSAGES_PER_CHANNEL = 200;
const DEFAULT_CHANNEL = { id: "general", name: "Général" };

export type ChatChannel = {
  id: string;
  name: string;
  createdAt: string;
  /** Si défini, salon privé visible uniquement par ces membres + le staff (ex: accueil d'une recrue). */
  memberIds?: string[];
};

export type ChatMessage = {
  id: string;
  channelId: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
};

export function canAccessChannel(
  channel: Pick<ChatChannel, "memberIds">,
  viewer: { userId: string; isStaff: boolean }
): boolean {
  if (!channel.memberIds || channel.memberIds.length === 0) return true;
  return viewer.isStaff || channel.memberIds.includes(viewer.userId);
}

/** Liste les salons visibles par le viewer ; crée automatiquement "Général" au tout premier accès. */
export async function listChannels(viewer?: { userId: string; isStaff: boolean }): Promise<ChatChannel[]> {
  const redis = getRedis();
  if (!redis) return [];

  const all = (await redis.hgetall<Record<string, ChatChannel>>(CHANNELS_KEY)) || {};
  if (Object.keys(all).length === 0) {
    const seeded: ChatChannel = { ...DEFAULT_CHANNEL, createdAt: new Date().toISOString() };
    await redis.hset(CHANNELS_KEY, { [seeded.id]: seeded });
    return [seeded];
  }

  const channels = Object.values(all).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (!viewer) return channels;
  return channels.filter((c) => canAccessChannel(c, viewer));
}

export async function getChannel(channelId: string): Promise<ChatChannel | null> {
  const redis = getRedis();
  if (!redis) return null;
  return (await redis.hget<ChatChannel>(CHANNELS_KEY, channelId)) ?? null;
}

export async function createChannel(name: string, memberIds?: string[]): Promise<ChatChannel | null> {
  const redis = getRedis();
  if (!redis) return null;

  const trimmed = name.trim().slice(0, 60);
  if (!trimmed) return null;

  const channel: ChatChannel = {
    id: crypto.randomUUID(),
    name: trimmed,
    createdAt: new Date().toISOString(),
    ...(memberIds && memberIds.length > 0 ? { memberIds } : {}),
  };
  await redis.hset(CHANNELS_KEY, { [channel.id]: channel });
  return channel;
}

/**
 * Ouvre un salon privé (recrue + staff) à l'acceptation d'une candidature, pour
 * l'accueil — équivalent du ticket Discord ouvert automatiquement côté CHP.
 */
export async function createWelcomeChannel(userId: string, displayName: string): Promise<ChatChannel | null> {
  const channel = await createChannel(`Accueil — ${displayName}`, [userId]);
  if (!channel) return null;

  await postMessage({
    channelId: channel.id,
    authorId: "system",
    authorName: "Système",
    content: [
      `Bienvenue au LAPD, ${displayName} ! Ce salon te permet d'échanger avec le staff pour finaliser ton arrivée.`,
      "N'hésite pas à poser tes questions ici.",
    ].join("\n"),
  });

  return channel;
}

/** Supprime un salon et tout son historique de messages. */
export async function deleteChannel(channelId: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.hdel(CHANNELS_KEY, channelId);
  await redis.del(`${MESSAGES_KEY_PREFIX}${channelId}`);
}

export async function getMessages(channelId: string, limit = 100): Promise<ChatMessage[]> {
  const redis = getRedis();
  if (!redis) return [];
  const raw = await redis.lrange<ChatMessage>(`${MESSAGES_KEY_PREFIX}${channelId}`, -limit, -1);
  return raw || [];
}

/** Poste un message et borne l'historique du salon (coût Redis maîtrisé). */
export async function postMessage(input: {
  channelId: string;
  authorId: string;
  authorName: string;
  content: string;
}): Promise<ChatMessage | null> {
  const redis = getRedis();
  if (!redis) return null;

  const content = input.content.trim().slice(0, 2000);
  if (!content) return null;

  const message: ChatMessage = {
    id: crypto.randomUUID(),
    channelId: input.channelId,
    authorId: input.authorId,
    authorName: input.authorName,
    content,
    timestamp: new Date().toISOString(),
  };

  const key = `${MESSAGES_KEY_PREFIX}${input.channelId}`;
  await redis.rpush(key, message);
  await redis.ltrim(key, -MAX_MESSAGES_PER_CHANNEL, -1);
  return message;
}
