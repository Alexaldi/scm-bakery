import { pbkdf2, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const pbkdf2Async = promisify(pbkdf2);
const ITERATIONS = 310000;
const KEY_LENGTH = 32;
const DIGEST = "sha256";

export async function hashPassword(password) {
  const salt = randomBytes(16).toString("base64url");
  const hash = await pbkdf2Async(String(password), salt, ITERATIONS, KEY_LENGTH, DIGEST);

  return `pbkdf2$${ITERATIONS}$${salt}$${hash.toString("base64url")}`;
}

export async function verifyPassword(password, storedHash) {
  const [scheme, iterations, salt, hash] = String(storedHash || "").split("$");
  if (scheme !== "pbkdf2" || !iterations || !salt || !hash) {
    return false;
  }

  const calculated = await pbkdf2Async(String(password), salt, Number(iterations), KEY_LENGTH, DIGEST);
  const expected = Buffer.from(hash, "base64url");

  return expected.length === calculated.length && timingSafeEqual(expected, calculated);
}
