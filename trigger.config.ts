import { defineConfig } from "@trigger.dev/sdk";
import { syncEnvVars } from "@trigger.dev/build/extensions/core";

/**
 * Variables requises par le worker Cloud `process-ticket`
 * (BDD + emails automation + garde-fous démo).
 * Ne pas synchroniser RESEND_API_KEY (contact portfolio uniquement).
 */
const WORKER_ENV_KEYS = [
  "DATABASE_URL",
  "GD_DEMO_ISOLATED",
  "RESEND_AUTOMATION_API_KEY",
  "AUTOMATION_FROM_EMAIL",
  "APP_URL",
] as const;

function resolveDemoAppUrl(): string | undefined {
  const explicit = process.env.APP_URL?.trim();
  if (explicit && !explicit.includes("localhost")) {
    return explicit.replace(/\/$/, "");
  }
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (site?.startsWith("https://") || site?.startsWith("http://")) {
    return `${site}/gestion-demandes`;
  }
  return explicit?.replace(/\/$/, "");
}

export default defineConfig({
  project: "proj_lqrgqdceewezsizfepsw",
  runtime: "node-24",
  logLevel: "info",
  maxDuration: 3600,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ["./src/gestion-demandes/trigger"],
  build: {
    extensions: [
      // À chaque `trigger deploy`, pousse les secrets worker vers l'env Cloud cible.
      // Lancer avec: npx trigger.dev@4.5.10 deploy --env-file .env.local
      syncEnvVars(async () => {
        const vars: Record<string, string> = {};
        for (const key of WORKER_ENV_KEYS) {
          const value = process.env[key]?.trim();
          if (value) vars[key] = value;
        }
        vars.GD_DEMO_ISOLATED = vars.GD_DEMO_ISOLATED || "true";
        const appUrl = resolveDemoAppUrl();
        if (appUrl) vars.APP_URL = appUrl;
        return vars;
      }),
    ],
  },
});
