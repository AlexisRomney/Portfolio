/**
 * Rate limit simple en mémoire (démo portfolio).
 * La clé ne repose PAS uniquement sur x-forwarded-for (spoofable).
 */

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((current.resetAt - now) / 1000),
      ),
    };
  }

  current.count += 1;
  buckets.set(key, current);
  return {
    allowed: true,
    remaining: Math.max(0, limit - current.count),
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((current.resetAt - now) / 1000),
    ),
  };
}

/**
 * Identifiant réseau pour info/logs uniquement.
 * Ne pas utiliser seul pour le rate-limit : spoofable hors proxy de confiance.
 */
export function getClientIp(request: Request): string {
  if (process.env.TRUST_PROXY === "true") {
    const realIp = request.headers.get("x-real-ip")?.trim();
    if (realIp) return realIp;
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
      return forwarded.split(",")[0]?.trim() || "unknown";
    }
  }
  return "unknown";
}

/**
 * Clé de rate-limit robuste pour une démo mono-instance :
 * - toujours un compartiment applicatif non spoofable (`scope:app`)
 * - si TRUST_PROXY=true, ajoute aussi une limite par IP de proxy
 */
export function getRateLimitKeys(request: Request, scope: string): string[] {
  const keys = [`${scope}:app`];
  if (process.env.TRUST_PROXY === "true") {
    const ip = getClientIp(request);
    if (ip && ip !== "unknown") {
      keys.push(`${scope}:ip:${ip}`);
    }
  }
  return keys;
}

export function enforceRateLimit(
  request: Request,
  scope: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  let blocked: RateLimitResult | null = null;
  let lastAllowed: RateLimitResult = {
    allowed: true,
    remaining: limit,
    retryAfterSeconds: Math.ceil(windowMs / 1000),
  };

  for (const key of getRateLimitKeys(request, scope)) {
    const result = checkRateLimit(key, limit, windowMs);
    if (!result.allowed) {
      if (
        !blocked ||
        result.retryAfterSeconds > blocked.retryAfterSeconds
      ) {
        blocked = result;
      }
    } else {
      lastAllowed = result;
    }
  }

  return blocked ?? lastAllowed;
}
