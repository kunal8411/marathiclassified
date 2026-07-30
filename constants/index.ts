export const COOKIE_ACCESS = "mc_access";
export const COOKIE_REFRESH = "mc_refresh";
export const COOKIE_CSRF = "mc_csrf";

export const USER_ROLES = ["user", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const AD_STATUSES = [
  "draft",
  "pending",
  "active",
  "rejected",
  "sold",
  "archived",
] as const;
export type AdStatus = (typeof AD_STATUSES)[number];

export const AD_CONDITIONS = ["new", "used"] as const;
export type AdCondition = (typeof AD_CONDITIONS)[number];

export const OTP_PURPOSES = ["register", "login", "verify"] as const;
export type OtpPurpose = (typeof OTP_PURPOSES)[number];

export const OTP_CHANNELS = ["email", "phone"] as const;
export type OtpChannel = (typeof OTP_CHANNELS)[number];

export const REPORT_TARGET_TYPES = ["ad", "user"] as const;
export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number];

export const REPORT_STATUSES = ["open", "resolved", "dismissed"] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const NOTIFICATION_TYPES = [
  "ad_approved",
  "ad_rejected",
  "new_message",
  "new_rating",
  "system",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const SORT_OPTIONS = [
  "newest",
  "oldest",
  "price_asc",
  "price_desc",
  "relevance",
] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const PROTECTED_PATH_PREFIXES = [
  "/sell",
  "/chat",
  "/favorites",
  "/profile",
  "/notifications",
  "/admin",
] as const;

export const ADMIN_PATH_PREFIXES = ["/admin"] as const;
