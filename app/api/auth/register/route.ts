import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/users";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS } from "@/lib/auth";

const ERROR_MESSAGES: Record<string, string> = {
  not_configured: "Comptes non configurés (base de données manquante).",
  invalid_username: "Nom d'utilisateur invalide (3 à 24 caractères, lettres/chiffres/espaces).",
  invalid_password: "Le mot de passe doit faire au moins 8 caractères.",
  username_taken: "Ce nom d'utilisateur est déjà pris.",
};

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.username || !body?.password) {
    return NextResponse.json({ error: "Nom d'utilisateur et mot de passe requis." }, { status: 400 });
  }

  const result = await createUser(String(body.username), String(body.password), body.staffKey ? String(body.staffKey) : undefined);
  if ("error" in result) {
    return NextResponse.json({ error: ERROR_MESSAGES[result.error] ?? "Erreur inconnue." }, { status: 400 });
  }

  const token = await createSessionToken({
    userId: result.user.id,
    username: result.user.username,
    isStaff: result.user.isStaff,
    rank: result.user.rank,
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION_SECONDS,
    path: "/",
  });
  return response;
}
