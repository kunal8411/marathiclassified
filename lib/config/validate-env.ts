import { logger } from "@/lib/middleware/logging";

/**
 * Validate required environment variables on app startup.
 * Fails fast if critical vars are missing.
 */
export function validateEnvironment() {
  const required = [
    "MONGODB_URI",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "NEXTAUTH_SECRET",
    "NEXT_PUBLIC_APP_URL",
  ];

  const optional = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "RESEND_API_KEY",
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "PUSHER_APP_ID",
    "PUSHER_KEY",
    "PUSHER_SECRET",
  ];

  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length) {
    const msg = `Missing required environment variables: ${missing.join(", ")}`;
    logger.error(msg);
    throw new Error(msg);
  }

  // Warn on missing optional integrations
  for (const key of optional) {
    if (!process.env[key] && process.env.NODE_ENV === "production") {
      logger.warn(`Optional env var not set: ${key}`);
    }
  }

  logger.info("Environment validation passed", { metadata: { nodeEnv: process.env.NODE_ENV } });
}
