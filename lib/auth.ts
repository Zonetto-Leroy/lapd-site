import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { RankCode } from "./ranks";

export const SESSION_COOKIE_NAME = "lapd_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 jours

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET manquant dans .env.local");
  }
  return new TextEncoder().encode(secret);
}

export type Session = {
  userId: string;
  username: string;
  isStaff: boolean;
  rank: RankCode | null;
};

/** Crée le JWT signé à stocker dans le cookie de session. */
export async function createSessionToken(session: Session): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

/** Lit et vérifie la session courante depuis le cookie (Server Components / Route Handlers). */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as Session;
  } catch {
    return null; // token invalide / expiré
  }
}

export { SESSION_DURATION_SECONDS };
