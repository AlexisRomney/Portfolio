import { getDb } from "@gd/lib/db/client";
import { ensureTicketsSchema } from "@gd/lib/db/schema";

export type AppSettings = {
  controlScoreThreshold: number;
  autoSendResponses: boolean;
};

const DEFAULT_SETTINGS: AppSettings = {
  controlScoreThreshold: 90,
  autoSendResponses: false,
};

const KEY_THRESHOLD = "control_score_threshold";
const KEY_AUTO_SEND = "auto_send_responses";

function parseThreshold(value: string | undefined): number {
  if (value === undefined) return DEFAULT_SETTINGS.controlScoreThreshold;
  const num = Number(value);
  if (!Number.isFinite(num)) return DEFAULT_SETTINGS.controlScoreThreshold;
  return Math.min(100, Math.max(0, Math.round(num)));
}

function parseBoolean(value: string | undefined): boolean {
  if (value === undefined) return DEFAULT_SETTINGS.autoSendResponses;
  return value === "true" || value === "1";
}

async function withSchema<T>(fn: () => Promise<T>): Promise<T> {
  await ensureTicketsSchema();
  return fn();
}

export async function getAppSettings(): Promise<AppSettings> {
  return withSchema(async () => {
    const sql = getDb();
    const rows = await sql`
      SELECT key, value FROM app_settings
      WHERE key = ${KEY_THRESHOLD} OR key = ${KEY_AUTO_SEND}
    `;

    const map = new Map<string, string>();
    for (const row of rows as { key: string; value: string }[]) {
      map.set(row.key, row.value);
    }

    return {
      controlScoreThreshold: parseThreshold(map.get(KEY_THRESHOLD)),
      autoSendResponses: parseBoolean(map.get(KEY_AUTO_SEND)),
    };
  });
}

export async function updateAppSettings(
  patch: Partial<AppSettings>,
): Promise<AppSettings> {
  return withSchema(async () => {
    const sql = getDb();
    const current = await getAppSettings();
    const next: AppSettings = {
      controlScoreThreshold:
        patch.controlScoreThreshold !== undefined
          ? Math.min(100, Math.max(0, Math.round(patch.controlScoreThreshold)))
          : current.controlScoreThreshold,
      autoSendResponses:
        patch.autoSendResponses !== undefined
          ? patch.autoSendResponses
          : current.autoSendResponses,
    };

    await sql`
      INSERT INTO app_settings (key, value, updated_at)
      VALUES (${KEY_THRESHOLD}, ${String(next.controlScoreThreshold)}, NOW())
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = NOW()
    `;
    await sql`
      INSERT INTO app_settings (key, value, updated_at)
      VALUES (${KEY_AUTO_SEND}, ${next.autoSendResponses ? "true" : "false"}, NOW())
      ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = NOW()
    `;

    return next;
  });
}
