import type { Metadata } from "next";
import { Manrope, Noto_Sans_Devanagari } from "next/font/google";

import { AppProviders } from "@/components/providers/app-providers";
import { siteConfig } from "@/config/site";
import { validateEnvironment } from "@/lib/config/validate-env";
import { logger } from "@/lib/middleware/logging";
import "./globals.css";

// Validate environment on app startup
if (typeof window === "undefined") {
  try {
    validateEnvironment();
  } catch (err) {
    logger.error("Failed to validate environment", err instanceof Error ? (err as Error) : new Error(String(err)));
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
}

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${notoDevanagari.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
