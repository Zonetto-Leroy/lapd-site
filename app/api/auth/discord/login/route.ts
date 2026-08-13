import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

const STATE_COOKIE_NAME = "lapd_oauth_state";

export async function GET() {
  const state = randomUUID();

  const authorizeUrl = new URL("https://discord.com/api/oauth2/authorize");
  authorizeUrl.searchParams.set("client_id", process.env.DISCORD_CLIENT_ID!);
  authorizeUrl.searchParams.set("redirect_uri", process.env.DISCORD_REDIRECT_URI!);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "identify guilds.members.read");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("prompt", "none");

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 5 * 60,
    path: "/",
  });
  return response;
}
