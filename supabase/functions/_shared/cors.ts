// Shared CORS helper for Pitchfork Protocol edge functions.
// Restricts Access-Control-Allow-Origin to known project origins
// instead of the permissive "*" default.

const ALLOWED_ORIGINS = new Set<string>([
  "https://protocol.pitchforks.social",
  "https://pitchforks.lovable.app",
  "https://id-preview--4861e725-e81e-41a2-9171-01461ac04b20.lovable.app",
  "http://localhost:8080",
  "http://localhost:5173",
]);

// Allow any *.lovable.app and *.lovableproject.com preview subdomain.
const ALLOWED_ORIGIN_SUFFIXES = [".lovable.app", ".lovableproject.com"];

export function buildCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  let allowedOrigin = "";
  if (ALLOWED_ORIGINS.has(origin)) {
    allowedOrigin = origin;
  } else {
    try {
      const host = new URL(origin).host;
      if (ALLOWED_ORIGIN_SUFFIXES.some((s) => host.endsWith(s))) {
        allowedOrigin = origin;
      }
    } catch {
      // Non-origin request (e.g. server-to-server) — leave empty.
    }
  }

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    Vary: "Origin",
  };
}
