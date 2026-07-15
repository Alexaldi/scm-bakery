import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionToken, verifySessionToken } from "./jwt";

export const AUTH_COOKIE = "scm_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  return verifySessionToken(token);
}

export async function setSessionCookie(user) {
  const cookieStore = await cookies();
  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  cookieStore.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(allowedRoles = []) {
  const session = await getSession();
  if (!session) {
    throw new Error("Sesi login tidak valid. Silakan login kembali.");
  }

  if (session.role !== "Administrator" && allowedRoles.length && !allowedRoles.includes(session.role)) {
    throw new Error("Role Anda tidak memiliki akses untuk aksi ini.");
  }

  return session;
}
