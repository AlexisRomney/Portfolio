import { logger, task } from "@trigger.dev/sdk";

/**
 * Task minimale de smoke test Trigger.dev.
 * Ne fait partie d'aucun workflow métier.
 */
export const helloWorldTask = task({
  id: "hello-world",
  run: async (payload: { message?: string }) => {
    const message = payload.message?.trim() || "Hello from Trigger.dev";

    logger.info("hello-world started", { message });

    return {
      ok: true as const,
      message,
      at: new Date().toISOString(),
    };
  },
});
