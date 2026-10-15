/**
 * Mode démonstration portfolio (sécurisé).
 * - Écritures BDD autorisées pour le workflow (tickets démo, logs, Trigger)
 * - Mutations admin / collaborateurs / settings / tickets non-démo interdites
 * - Emails Resend réels avec quota 5 / adresse destinataire
 *
 * GD_DEMO_ISOLATED=false désactive ces garde-fous (debug uniquement).
 */
export function isDemoMode(): boolean {
  const raw = process.env.GD_DEMO_ISOLATED?.trim().toLowerCase();
  if (raw === "false" || raw === "0" || raw === "off") return false;
  return true;
}

/** @deprecated alias ; conserve la compatibilité des imports existants */
export function isDemoIsolated(): boolean {
  return isDemoMode();
}

export const DEMO_EMAIL_LIMIT = 5;

export const DEMO_FORBIDDEN = "DEMO_FORBIDDEN" as const;
export const DEMO_EMAIL_LIMIT_REACHED = "DEMO_EMAIL_LIMIT_REACHED" as const;
