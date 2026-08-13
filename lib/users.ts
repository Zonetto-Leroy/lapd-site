import { getRedis } from "./redis";
import { hashPassword, verifyPassword } from "./passwords";
import type { RankCode } from "./ranks";

const USERS_KEY = "lapd:users";
const USERNAME_INDEX_KEY = "lapd:username-index";

export type User = {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: string;
  isStaff: boolean;
  rank: RankCode | null;
  characterName: string | null;
  badgeNumber: string | null;
};

function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const redis = getRedis();
  if (!redis) return null;
  const userId = await redis.hget<string>(USERNAME_INDEX_KEY, normalizeUsername(username));
  if (!userId) return null;
  return (await redis.hget<User>(USERS_KEY, userId)) ?? null;
}

export async function getUserById(id: string): Promise<User | null> {
  const redis = getRedis();
  if (!redis) return null;
  return (await redis.hget<User>(USERS_KEY, id)) ?? null;
}

export type CreateUserResult = { user: User } | { error: "not_configured" | "invalid_username" | "invalid_password" | "username_taken" };

export async function createUser(username: string, password: string, staffKey?: string): Promise<CreateUserResult> {
  const redis = getRedis();
  if (!redis) return { error: "not_configured" };

  const clean = username.trim();
  if (clean.length < 3 || clean.length > 24 || !/^[a-zA-Z0-9_\-. ]+$/.test(clean)) {
    return { error: "invalid_username" };
  }
  if (password.length < 8) return { error: "invalid_password" };

  const existing = await getUserByUsername(clean);
  if (existing) return { error: "username_taken" };

  const isStaff = Boolean(staffKey && process.env.STAFF_SIGNUP_KEY && staffKey === process.env.STAFF_SIGNUP_KEY);

  const user: User = {
    id: crypto.randomUUID(),
    username: clean,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
    isStaff,
    rank: null,
    characterName: null,
    badgeNumber: null,
  };

  await redis.hset(USERS_KEY, { [user.id]: user });
  await redis.hset(USERNAME_INDEX_KEY, { [normalizeUsername(clean)]: user.id });
  return { user };
}

export async function verifyLogin(username: string, password: string): Promise<User | null> {
  const user = await getUserByUsername(username);
  if (!user) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;
  return user;
}

/** Tous les comptes ayant un grade — l'effectif de police. */
export async function listOfficers(): Promise<User[]> {
  const redis = getRedis();
  if (!redis) return [];
  const all = (await redis.hgetall<Record<string, User>>(USERS_KEY)) || {};
  return Object.values(all).filter((u) => u.rank !== null);
}

export async function listAllUsers(): Promise<User[]> {
  const redis = getRedis();
  if (!redis) return [];
  const all = (await redis.hgetall<Record<string, User>>(USERS_KEY)) || {};
  return Object.values(all).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function updateUserRank(
  userId: string,
  rank: RankCode | null,
  characterName?: string | null,
  badgeNumber?: string | null
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  const user = await getUserById(userId);
  if (!user) return;
  const updated: User = {
    ...user,
    rank,
    characterName: characterName !== undefined ? characterName : user.characterName,
    badgeNumber: badgeNumber !== undefined ? badgeNumber : user.badgeNumber,
  };
  await redis.hset(USERS_KEY, { [userId]: updated });
}
