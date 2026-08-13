const DISCORD_API = "https://discord.com/api/v10";

export type DiscordEmbed = {
  title?: string;
  description?: string;
  color?: number;
  author?: { name: string; icon_url?: string };
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
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

export type DiscordApiResult = { ok: boolean; error?: string };

/** Poste un message (avec embed(s) et boutons optionnels) dans un salon du Discord CLK, via le token du bot. */
export async function postChannelMessage(
  channelId: string,
  embeds: DiscordEmbed[],
  buttons: DiscordButton[] = []
): Promise<DiscordApiResult> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) return { ok: false, error: "DISCORD_BOT_TOKEN manquant" };

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
  return { ok: true };
}
