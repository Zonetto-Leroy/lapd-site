import { NextRequest, NextResponse } from "next/server";
import { verifyLogin } from "@/lib/users";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.username || !body?.password) {
    return NextResponse.json({ error: "Nom d'utilisateur et mot de passe requis." }, { status: 400 });
  }

  const user = await verifyLogin(String(body.username), String(body.password));
  if (!user) {
    return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
  }

  const token = await createSessionToken({
    userId: user.id,
    username: user.username,
    isStaff: user.isStaff,
    rank: user.rank,
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
