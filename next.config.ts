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
  /**
   * Images are served from /public without the Next.js optimizer.
   *
   * Kept after visual QA: Vercel/Next image optimization previously softened
   * mockup captures. Sources are pre-exported WebP (see public/mockups) with
   * explicit width/height in project data.
   *
   * To re-enable later: set unoptimized to false and validate mockups on a Vercel
   * preview (Image Optimization quota + sharpness). No code change required in
   * MockupFrame beyond optional `quality` if needed.
   */
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
