const encoder = new TextEncoder();

function base64UrlEncode(value) {
  const bytes = typeof value === "string" ? encoder.encode(value) : value;
  if (typeof btoa === "function") {
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
  }

  return globalThis.Buffer.from(bytes).toString("base64url");
}

function base64UrlDecode(value) {
  if (typeof atob === "function") {
    const base64 = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    return decodeURIComponent(
      Array.from(atob(base64), (character) => `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`).join("")
    );
  }

  return globalThis.Buffer.from(value, "base64url").toString("utf8");
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return base64UrlEncode(new Uint8Array(signature));
}

function safeEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
}

export async function createSessionToken(payload, options = {}) {
  const now = options.now || Math.floor(Date.now() / 1000);
  const maxAgeSeconds = options.maxAgeSeconds || 60 * 60 * 8;
  const secret = options.secret || process.env.AUTH_SECRET || process.env.JWT_SECRET || "dev-secret-change-me";
  const header = { alg: "HS256", typ: "JWT" };
  const body = { ...payload, iat: now, exp: now + maxAgeSeconds };
  const unsigned = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(body))}`;

  return `${unsigned}.${await sign(unsigned, secret)}`;
}

export async function verifySessionToken(token, options = {}) {
  try {
    const [header, body, signature] = String(token || "").split(".");
    if (!header || !body || !signature) {
      return null;
    }

    const secret = options.secret || process.env.AUTH_SECRET || process.env.JWT_SECRET || "dev-secret-change-me";
    const unsigned = `${header}.${body}`;
    const expectedSignature = await sign(unsigned, secret);

    if (!safeEqual(signature, expectedSignature)) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(body));
    const now = options.now || Math.floor(Date.now() / 1000);

    if (!payload.exp || payload.exp <= now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
