import { decideCandidature, listCandidatures, type Candidature } from "./candidatures";
import { updateUserRank } from "./users";
import { STARTING_RANK } from "./ranks";
import { createWelcomeChannel, type ChatChannel } from "./chat";

export type CandidatureDecisionResult = {
  candidature: Candidature;
  welcomeChannel: ChatChannel | null;
};

/**
 * Applique une décision (accepter/refuser) sur une candidature : appelée aussi bien
 * par le bot Discord (relais du salon #candidatures-services) que par un futur appel
 * direct — centralise l'attribution du grade et l'ouverture du salon d'accueil.
 */
export async function applyCandidatureDecision(
  candidatureId: string,
  action: "accept" | "refuse",
  decidedBy: string
): Promise<CandidatureDecisionResult | null> {
  const all = await listCandidatures();
  const target = all.find((c) => c.id === candidatureId);
  if (!target) return null;

  const updated = await decideCandidature(candidatureId, action === "accept" ? "accepted" : "refused", decidedBy);
  if (!updated) return null;

  let welcomeChannel: ChatChannel | null = null;
  if (action === "accept") {
    await updateUserRank(target.userId, STARTING_RANK, target.characterName);
    welcomeChannel = await createWelcomeChannel(target.userId, target.characterName || target.username);
  }

  return { candidature: updated, welcomeChannel };
}
