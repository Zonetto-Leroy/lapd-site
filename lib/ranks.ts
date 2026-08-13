/** Grades LAPD réels, du plus bas au plus haut — plafonné à Captain III (pas de hiérarchie au-delà sur ce serveur). */
export const RANKS = [
  "Police Officer I",
  "Police Officer II",
  "Police Officer III",
  "Detective I",
  "Detective II",
  "Detective III",
  "Sergeant I",
  "Sergeant II",
  "Lieutenant I",
  "Lieutenant II",
  "Captain I",
  "Captain II",
  "Captain III",
] as const;

export type RankCode = (typeof RANKS)[number];

export function isRankCode(value: string): value is RankCode {
  return (RANKS as readonly string[]).includes(value);
}

export function rankIndex(rank: RankCode): number {
  return RANKS.indexOf(rank);
}

/** Grade de départ attribué automatiquement quand une candidature est acceptée. */
export const STARTING_RANK: RankCode = "Police Officer I";
