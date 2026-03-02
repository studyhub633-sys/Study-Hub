const DEFAULT_ALLOWED_ORIGINS = [
  "https://revisely.ai",
  "https://www.revisely.ai",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3004",
];

function parseAllowedOriginsFromEnv() {
  const raw =
    process.env.CORS_ALLOWED_ORIGINS ||
    process.env.ALLOWED_ORIGINS ||
    process.env.VITE_ALLOWED_ORIGINS;

  if (!raw) return null;

  const list = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return list.length ? list : null;
}

export function getAllowedOrigins() {
  return parseAllowedOriginsFromEnv() || DEFAULT_ALLOWED_ORIGINS;
}

export function setNoStore(res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
}

/**
 * Applies a safe CORS policy for token-based APIs.
 * - No wildcard origins
 * - No credentials (cookies) by default
 * Returns true if the request was an OPTIONS preflight and has been ended.
 */
export function applyCors(req, res, { allowCredentials = false } = {}) {
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    if (allowCredentials) {
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }
  }

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return true;
  }

  return false;
}

