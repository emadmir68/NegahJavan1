const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64Url(bytes) {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

async function hmac(secret, value) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

function constantTimeEqual(a, b) {
  const aa = encoder.encode(String(a));
  const bb = encoder.encode(String(b));
  const len = Math.max(aa.length, bb.length);
  let diff = aa.length ^ bb.length;
  for (let i = 0; i < len; i++) diff |= (aa[i] || 0) ^ (bb[i] || 0);
  return diff === 0;
}

function parseCookies(request) {
  const raw = request.headers.get("Cookie") || "";
  return Object.fromEntries(raw.split(";").map(v => v.trim()).filter(Boolean).map(v => {
    const idx = v.indexOf("=");
    return idx < 0 ? [v, ""] : [v.slice(0, idx), v.slice(idx + 1)];
  }));
}

export function authConfigured(env) {
  return Boolean(env?.ADMIN_PASSWORD && env?.AUTH_SECRET);
}

export function passwordMatches(env, candidate) {
  return authConfigured(env) && constantTimeEqual(candidate || "", env.ADMIN_PASSWORD);
}

export async function createSession(env) {
  const payload = {
    role: "editor",
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
    nonce: crypto.randomUUID()
  };
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const sig = toBase64Url(await hmac(env.AUTH_SECRET, body));
  return `${body}.${sig}`;
}

export async function verifySession(request, env) {
  if (!authConfigured(env)) return false;
  const token = parseCookies(request).negahjavan_session;
  if (!token) return false;
  const [body, sig] = token.split(".");
  if (!body || !sig) return false;
  const expected = toBase64Url(await hmac(env.AUTH_SECRET, body));
  if (!constantTimeEqual(sig, expected)) return false;
  try {
    const payload = JSON.parse(decoder.decode(fromBase64Url(body)));
    return payload.role === "editor" && Number(payload.exp) > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function sessionCookie(token) {
  return `negahjavan_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`;
}

export function clearSessionCookie() {
  return "negahjavan_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0";
}

export function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}
