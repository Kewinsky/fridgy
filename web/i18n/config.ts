export const locales = ["pl", "en", "de", "fr", "es"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "pl";
export const localeCookieName = "FRIDGY_LOCALE";

export const localeNames: Record<Locale, string> = {
  pl: "Polski",
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
};

export function isLocale(value: string | undefined): value is Locale {
  return locales.some((locale) => locale === value);
}
