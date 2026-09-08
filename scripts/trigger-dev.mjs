/**
 * Lance le worker Trigger.dev DEV en forçant un contexte non-CI.
 * Cursor / certains agents exportent CI=true, ce qui fait échouer
 * `trigger.dev dev` sur un faux mismatch de versions.
 */
import { spawn } from "node:child_process";

const env = { ...process.env };
delete env.CI;
delete env.GITHUB_ACTIONS;
delete env.GITHUB_WORKFLOW;

const npxBin = process.platform === "win32" ? "npx.cmd" : "npx";

const child = spawn(
  npxBin,
  [
    "trigger.dev@4.5.10",
    "dev",
    "--skip-mcp-install",
    "--skip-rules-install",
    "--skip-update-check",
  ],
  {
    stdio: "inherit",
    env,
    cwd: process.cwd(),
    shell: false,
  },
);

child.on("error", (err) => {
  console.error("[trigger:dev] failed to start:", err);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
