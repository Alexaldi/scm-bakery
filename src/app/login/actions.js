"use server";

import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { clearSessionCookie, setSessionCookie } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";

export async function loginAction(_state, formData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { ok: false, message: "Email dan password wajib diisi." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user?.status === "ACTIVE" && (await verifyPassword(password, user.passwordHash));

  if (!valid) {
    return { ok: false, message: "Email atau password tidak sesuai." };
  }

  await setSessionCookie(user);
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
