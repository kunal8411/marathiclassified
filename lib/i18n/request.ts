import { getRequestConfig } from "next-intl/server";
import { siteConfig, type Locale } from "@/config/site";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !siteConfig.locales.includes(locale as Locale)) {
    locale = siteConfig.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
