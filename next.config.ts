import type { NextConfig } from "next";
import path from "node:path";

/**
 * Pin an absolute project root for Turbopack + output file tracing.
 *
 * On Vercel, Next's lockfile-based root autodetection can leave the adapter
 * with an undefined path during "Applying modifyConfig from Vercel", which
 * crashes the build with:
 *   TypeError: The "path" argument must be of type string. Received undefined
 *
 * process.cwd() is the project directory on Vercel and avoids import.meta
 * edge cases when the platform re-evaluates next.config.
 */
const projectRoot = path.resolve(process.cwd());

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
