"use server";

import { cookies } from "next/headers";

import { isLocale, localeCookieName, type Locale } from "@/i18n/config";

export async function changeLocale(locale: Locale) {
  if (!isLocale(locale)) return;

  const cookieStore = await cookies();
  cookieStore.set(localeCookieName, locale, {
    maxAge: 31_536_000,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
