import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  computeTopRole,
  discordAvatarUrl,
  exchangeCodeForToken,
  fetchDiscordUser,
  fetchGuildRoles,
  fetchGuildMember,
  fetchMemberNick,
  roleColorToHex,
} from "@/lib/discord";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS, type SessionRole } from "@/lib/auth";

const STATE_COOKIE_NAME = "lapd_oauth_state";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE_NAME)?.value;

  if (error) {
    return NextResponse.redirect(new URL(`/?auth_error=${encodeURIComponent(error)}`, request.url));
  }
  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/?auth_error=state_mismatch", request.url));
  }

  try {
    const tokenData = await exchangeCodeForToken(code);
    const user = await fetchDiscordUser(tokenData.access_token);
    const member = await fetchGuildMember(tokenData.access_token);
    const memberRoleIds = member?.roleIds ?? null;
    const nick = memberRoleIds !== null ? await fetchMemberNick(user.id) : null;

    let roles: SessionRole[] = [];
    let topRole: SessionRole | null = null;

    if (memberRoleIds && memberRoleIds.length) {
      const guildRoles = await fetchGuildRoles();
      const roleById = new Map(guildRoles.map((r) => [r.id, r]));

      roles = memberRoleIds
        .map((id) => roleById.get(id))
        .filter((r): r is NonNullable<typeof r> => Boolean(r) && !r!.managed)
        .sort((a, b) => b.position - a.position)
        .map((r) => ({ id: r.id, name: r.name, color: roleColorToHex(r.color), position: r.position }));

      const top = computeTopRole(memberRoleIds, guildRoles);
      topRole = top ? { id: top.id, name: top.name, color: roleColorToHex(top.color), position: top.position } : null;
    }

    const token = await createSessionToken({
      discordId: user.id,
      username: user.username,
      displayName: nick || user.global_name || user.username,
      avatarUrl: discordAvatarUrl(user),
      isMember: memberRoleIds !== null,
      roles,
      topRole,
    });

    const response = NextResponse.redirect(new URL("/profil", request.url));
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION_SECONDS,
      path: "/",
    });
    response.cookies.delete(STATE_COOKIE_NAME);
    return response;
  } catch (err) {
    console.error("[auth/callback] échec :", err);
    return NextResponse.redirect(new URL("/?auth_error=server_error", request.url));
  }
}
