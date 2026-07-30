export const siteConfig = {
  name: "Marathi Classifieds",
  nameMr: "मराठी वर्गीकृत",
  description: "Buy and sell locally across Maharashtra — the Marathi marketplace.",
  descriptionMr: "महाराष्ट्रात खरेदी-विक्री करा — मराठी मार्केटप्लेस.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  locales: ["en", "mr"] as const,
  defaultLocale: "en" as const,
  currency: "INR" as const,
  defaultRadiusKm: 25,
  maxImagesPerAd: 8,
  otpExpiryMinutes: 10,
  otpLength: 6,
  accessTokenTtl: "15m",
  refreshTokenTtl: "7d",
  pageSize: 20,
} as const;

export type Locale = (typeof siteConfig.locales)[number];
