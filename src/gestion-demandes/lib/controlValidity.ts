import type { Ticket } from "@gd/types/ticket";

/**
 * Un résultat de contrôle est courant uniquement s'il termine exactement la
 * dernière tentative lancée pour ce ticket.
 */
export function hasCurrentAiControl(
  ticket: Pick<
    Ticket,
    "controlAttemptVersion" | "controlCompletedVersion"
  >,
): boolean {
  return (
    ticket.controlAttemptVersion > 0 &&
    ticket.controlCompletedVersion === ticket.controlAttemptVersion
  );
}
