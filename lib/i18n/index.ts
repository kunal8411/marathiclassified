import { siteConfig, type Locale } from "@/config/site";

export function isLocale(value: string): value is Locale {
  return siteConfig.locales.includes(value as Locale);
}

export function getLocalizedName(
  name: { en: string; mr: string },
  locale: string,
): string {
  return locale === "mr" ? name.mr : name.en;
}
