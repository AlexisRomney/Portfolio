import { getDb } from "@gd/lib/db/client";
import { ensureTicketsSchema } from "@gd/lib/db/schema";
import {
  DEMO_EMAIL_LIMIT,
  DEMO_EMAIL_LIMIT_REACHED,
  isDemoMode,
} from "@gd/lib/demo-isolation";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Vérifie et incrémente le quota d’emails Resend par destinataire (mode démo).
 * Doit être appelé côté serveur avant tout envoi réel.
 */
export async function consumeDemoEmailQuota(
  recipientEmail: string,
): Promise<{ ok: true; remaining: number } | { ok: false; error: string }> {
  if (!isDemoMode()) {
    return { ok: true, remaining: DEMO_EMAIL_LIMIT };
  }

  await ensureTicketsSchema();
  const sql = getDb();
  const email = normalizeEmail(recipientEmail);
  if (!email || !email.includes("@")) {
    return { ok: false, error: "INVALID_EMAIL" };
  }

  const rows = await sql`
    INSERT INTO demo_email_quota (email, send_count, updated_at)
    VALUES (${email}, 1, NOW())
    ON CONFLICT (email) DO UPDATE SET
      send_count = demo_email_quota.send_count + 1,
      updated_at = NOW()
    WHERE demo_email_quota.send_count < ${DEMO_EMAIL_LIMIT}
    RETURNING send_count
  `;

  if (!rows[0]) {
    return { ok: false, error: DEMO_EMAIL_LIMIT_REACHED };
  }

  const count = Number(
    (rows[0] as { send_count: number | string }).send_count,
  );
  return {
    ok: true,
    remaining: Math.max(0, DEMO_EMAIL_LIMIT - count),
  };
}
