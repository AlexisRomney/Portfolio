import { isDemoMode } from "@gd/lib/demo-isolation";
import type { ControlDecision } from "@gd/types/control";

/** Score minimal (0–1) pour autoriser l’automatisation en démo publique. */
export const DEMO_AUTOMATION_MIN_SCORE = 0.7;

type RoutingLike = {
  department?: string | null;
  assigneeName?: string | null;
} | null;

/**
 * En mode démo, assouplit le contrôle IA uniquement lorsque :
 * - le routage est complet (service + assigné) ;
 * - le score de contrôle est raisonnable (>= 0.7).
 *
 * Objectif : permettre Trigger.dev / Resend sur une vraie demande démo,
 * sans ouvrir les tickets hors démo ni les actions admin.
 */
export function applyDemoAutomationEligibility(
  control: ControlDecision | null,
  routing: RoutingLike,
): ControlDecision | null {
  if (!isDemoMode() || !control) return control;
  if (control.approved === true && control.requiresHumanReview !== true) {
    return control;
  }
  if ((control.score ?? 0) < DEMO_AUTOMATION_MIN_SCORE) return control;
  if (!routing?.department?.trim() || !routing?.assigneeName?.trim()) {
    return control;
  }

  const note =
    "Démo publique : automatisation autorisée (routage OK, score suffisant).";
  return {
    ...control,
    approved: true,
    requiresHumanReview: false,
    reviewReason: null,
    controlSummary: control.controlSummary
      ? `${control.controlSummary}. ${note}`
      : note,
  };
}
