const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin"
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PLATFORMS = new Set(["Android", "iOS", "Windows", "macOS", "Linux", "ChromeOS", "Unknown"]);

async function trackInstall(request, env) {
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) {
        return json({ error: "Cross-origin request blocked." }, 403);
      }
    } catch {
      return json({ error: "Invalid origin." }, 403);
    }
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 1024) return json({ error: "Request too large." }, 413);

  let body;
  try {
    const raw = await request.text();
    if (raw.length > 1024) return json({ error: "Request too large." }, 413);
    body = JSON.parse(raw);
  } catch { return json({ error: "Invalid JSON." }, 400); }

  const deviceId = typeof body.device_id === "string" ? body.device_id.trim() : "";
  const platform = typeof body.platform === "string" ? body.platform : "";
  if (!UUID_V4.test(deviceId)) return json({ error: "A valid device UUID is required." }, 400);
  if (!PLATFORMS.has(platform)) return json({ error: "Unsupported platform." }, 400);
  if (!env.INSTALL_TRACK_SECRET || !env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return json({ error: "Install tracking is not configured." }, 503);
  }

  if (env.INSTALL_RATE_LIMIT) {
    const { success } = await env.INSTALL_RATE_LIMIT.limit({ key: deviceId });
    if (!success) return json({ error: "Too many install requests. Try again later." }, 429);
  }

  let userId = null;
  const authorization = request.headers.get("authorization") || "";
  if (/^Bearer\s+\S+$/i.test(authorization)) {
    try {
      const userResponse = await fetch(env.SUPABASE_URL + "/auth/v1/user", {
        headers: { apikey: env.SUPABASE_ANON_KEY, authorization }
      });
      if (userResponse.ok) {
        const user = await userResponse.json();
        if (typeof user.id === "string" && UUID_V4.test(user.id)) userId = user.id;
      }
    } catch {
      // An install remains valid without a linked account.
    }
  }

  const rpcResponse = await fetch(env.SUPABASE_URL + "/rest/v1/rpc/record_app_install", {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      authorization: "Bearer " + env.SUPABASE_ANON_KEY,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      p_device_id: deviceId,
      p_platform: platform,
      p_user_id: userId,
      p_secret: env.INSTALL_TRACK_SECRET
    })
  });

  if (!rpcResponse.ok) {
    return json({ error: "Install could not be recorded." }, 502);
  }
  const inserted = await rpcResponse.json();
  return json({ ok: true, inserted: inserted === true }, inserted === true ? 201 : 200);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/track-install") return trackInstall(request, env);
    if (url.pathname.startsWith("/api/")) return json({ error: "Not found." }, 404);
    return env.ASSETS.fetch(request);
  }
};
