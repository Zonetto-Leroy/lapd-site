const DISCORD_API = "https://discord.com/api/v10";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} manquant dans .env.local`);
  return value;
}

export type DiscordTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
};

/** Échange le "code" OAuth reçu du callback contre un access token utilisateur. */
export async function exchangeCodeForToken(code: string): Promise<DiscordTokenResponse> {
  const body = new URLSearchParams({
    client_id: requireEnv("DISCORD_CLIENT_ID"),
    client_secret: requireEnv("DISCORD_CLIENT_SECRET"),
    grant_type: "authorization_code",
    code,
    redirect_uri: requireEnv("DISCORD_REDIRECT_URI"),
  });

  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    throw new Error(`Échec de l'échange OAuth Discord (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

export type DiscordUser = {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
};

/** Récupère l'identité du visiteur via SON propre access token (scope "identify"). */
export async function fetchDiscordUser(accessToken: string): Promise<DiscordUser> {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Impossible de récupérer le profil Discord (${res.status})`);
  return res.json();
}

export function discordAvatarUrl(user: DiscordUser): string | null {
  if (!user.avatar) return null;
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`;
}

export type DiscordGuildMember = {
  roleIds: string[];
};

/**
 * Récupère les rôles du visiteur sur le serveur LAPD, via SON propre access token
 * (scope "guilds.members.read"). Retourne null s'il n'est pas membre du serveur.
 */
export async function fetchGuildMember(accessToken: string): Promise<DiscordGuildMember | null> {
  const guildId = requireEnv("DISCORD_GUILD_ID");
  const res = await fetch(`${DISCORD_API}/users/@me/guilds/${guildId}/member`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 404) return null; // pas membre du serveur
  if (!res.ok) throw new Error(`Impossible de récupérer les rôles Discord (${res.status})`);

  const data = await res.json();
  return { roleIds: (data.roles as string[]) || [] };
}

/** Pseudo serveur d'un membre précis via le token du bot — fiable, contrairement à l'endpoint "@me". */
export async function fetchMemberNick(userId: string): Promise<string | null> {
  const guildId = requireEnv("DISCORD_GUILD_ID");
  const botToken = requireEnv("DISCORD_BOT_TOKEN");
  const res = await fetch(`${DISCORD_API}/guilds/${guildId}/members/${userId}`, {
    headers: { Authorization: `Bot ${botToken}` },
  });
  if (!res.ok) return null;

  const data = await res.json();
  return (data.nick as string | null) ?? null;
}

export type DiscordRoleDef = {
  id: string;
  name: string;
  color: number;
  position: number;
  managed: boolean;
};

/** Définition complète des rôles du serveur LAPD via le token du bot. */
export async function fetchGuildRoles(): Promise<DiscordRoleDef[]> {
  const guildId = requireEnv("DISCORD_GUILD_ID");
  const botToken = requireEnv("DISCORD_BOT_TOKEN");

  const res = await fetch(`${DISCORD_API}/guilds/${guildId}/roles`, {
    headers: { Authorization: `Bot ${botToken}` },
    next: { revalidate: 300 },
  });
  if (!res.ok) return [];
  return res.json();
}

export function roleColorToHex(color: number): string {
  if (!color) return "#99a1af";
  return `#${color.toString(16).padStart(6, "0")}`;
}

export function computeTopRole(memberRoleIds: string[], guildRoles: DiscordRoleDef[]): DiscordRoleDef | null {
  const roleById = new Map(guildRoles.map((r) => [r.id, r]));
  const owned = memberRoleIds
    .map((id) => roleById.get(id))
    .filter((r): r is DiscordRoleDef => r != null && !r.managed)
    .sort((a, b) => b.position - a.position);
  return owned[0] ?? null;
}

export type GuildStats = {
  memberCount: number;
  onlineCount: number;
  boostCount: number;
};

/** Statistiques publiques du serveur (compteurs approximatifs fournis par Discord). */
export async function fetchGuildStats(): Promise<GuildStats | null> {
  const guildId = requireEnv("DISCORD_GUILD_ID");
  const botToken = requireEnv("DISCORD_BOT_TOKEN");

  const res = await fetch(`${DISCORD_API}/guilds/${guildId}?with_counts=true`, {
    headers: { Authorization: `Bot ${botToken}` },
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;

  const data = await res.json();
  return {
    memberCount: data.approximate_member_count ?? 0,
    onlineCount: data.approximate_presence_count ?? 0,
    boostCount: data.premium_subscription_count ?? 0,
  };
}

type RawMember = {
  user: { id: string; username: string; global_name: string | null; avatar: string | null; bot?: boolean };
  nick: string | null;
  avatar: string | null;
  roles: string[];
};

/** Pagine sur tous les membres du serveur via le token du bot (le token du visiteur ne donne accès qu'à lui-même). */
async function fetchRawMembers(): Promise<RawMember[]> {
  const guildId = requireEnv("DISCORD_GUILD_ID");
  const botToken = requireEnv("DISCORD_BOT_TOKEN");

  const members: RawMember[] = [];
  let after = "0";
  for (let i = 0; i < 10; i++) {
    const res = await fetch(`${DISCORD_API}/guilds/${guildId}/members?limit=1000&after=${after}`, {
      headers: { Authorization: `Bot ${botToken}` },
      next: { revalidate: 300 },
    });
    if (!res.ok) break;
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    members.push(...batch);
    if (batch.length < 1000) break;
    after = batch[batch.length - 1].user.id;
  }
  return members;
}

function memberAvatarUrl(guildId: string, m: RawMember): string | null {
  if (m.avatar) return `https://cdn.discordapp.com/guilds/${guildId}/users/${m.user.id}/avatars/${m.avatar}.png?size=64`;
  if (m.user.avatar) return `https://cdn.discordapp.com/avatars/${m.user.id}/${m.user.avatar}.png?size=64`;
  return null;
}

export type RosterMember = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  topRole: DiscordRoleDef | null;
};

/** Annuaire des membres humains du serveur LAPD, triés par grade (rôle le plus haut d'abord). */
export async function fetchRosterMembers(): Promise<RosterMember[]> {
  const guildId = requireEnv("DISCORD_GUILD_ID");
  const [members, guildRoles] = await Promise.all([fetchRawMembers(), fetchGuildRoles()]);

  return members
    .filter((m) => !m.user.bot)
    .map((m) => ({
      id: m.user.id,
      displayName: m.nick || m.user.global_name || m.user.username,
      avatarUrl: memberAvatarUrl(guildId, m),
      topRole: computeTopRole(m.roles, guildRoles),
    }))
    .sort((a, b) => (b.topRole?.position ?? -1) - (a.topRole?.position ?? -1));
}

export type DiscordEmbed = {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  author?: { name: string; icon_url?: string };
  thumbnail?: { url: string };
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  footer?: { text: string; icon_url?: string };
  timestamp?: string;
};

export type DiscordButton = {
  label: string;
  customId: string;
  style: "primary" | "secondary" | "success" | "danger";
};

const BUTTON_STYLES: Record<DiscordButton["style"], number> = {
  primary: 1,
  secondary: 2,
  success: 3,
  danger: 4,
};

export type DiscordApiResult = { ok: boolean; error?: string; id?: string };

/** Poste un message (avec embed(s) et boutons optionnels) dans un salon via le token du bot. */
export async function postChannelMessage(
  channelId: string,
  embeds: DiscordEmbed[],
  buttons: DiscordButton[] = []
): Promise<DiscordApiResult> {
  const botToken = requireEnv("DISCORD_BOT_TOKEN");
  const components = buttons.length
    ? [
        {
          type: 1,
          components: buttons.map((b) => ({
            type: 2,
            style: BUTTON_STYLES[b.style],
            label: b.label,
            custom_id: b.customId,
          })),
        },
      ]
    : undefined;

  const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bot ${botToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ embeds, components }),
  });
  if (!res.ok) return { ok: false, error: await res.text() };
  const posted: { id: string } = await res.json();
  return { ok: true, id: posted.id };
}
