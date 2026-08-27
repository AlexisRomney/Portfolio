import type { Ticket } from "@gd/types/ticket";
import { hasCurrentAiControl } from "@gd/lib/controlValidity";

export type AutoSendSettings = {
  controlScoreThreshold: number;
  autoSendResponses: boolean;
};

/** Score de contrôle IA en pourcentage (0–100). `controlScore` est stocké entre 0 et 1. */
export function controlScorePercent(score: number | null): number | null {
  if (score === null || score === undefined || !Number.isFinite(score)) {
    return null;
  }
  return score * 100;
}

/**
 * Envoi automatique autorisé uniquement si :
 * contrôle IA réussi + score >= seuil + pas de revue humaine + mode auto activé.
 */
export function isAutoSendCustomerResponseAllowed(
  ticket: Ticket,
  settings: AutoSendSettings,
): boolean {
  if (!settings.autoSendResponses) return false;
  // `responseSent` est informatif (dernier envoi) : l'idempotence réelle
  // porte sur le contenu / sendKey du message, pas sur ce booléen global.
  if (!hasCurrentAiControl(ticket)) return false;
  if (ticket.controlApproved !== true) return false;
  if (ticket.requiresHumanReview === true) return false;

  const percent = controlScorePercent(ticket.controlScore);
  if (percent === null) return false;
  if (percent < settings.controlScoreThreshold) return false;

  if (!ticket.email?.trim()) return false;
  if (!ticket.aiResponse?.trim()) return false;

  return true;
}
