import type {
  AdCondition,
  AdStatus,
  NotificationType,
  OtpChannel,
  OtpPurpose,
  ReportStatus,
  ReportTargetType,
  SortOption,
  UserRole,
} from "@/constants";

export type LocalizedString = {
  en: string;
  mr: string;
};

export type GeoPoint = {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
  city?: string;
  area?: string;
  state?: string;
};

export type DynamicFieldType = "text" | "number" | "select" | "boolean";

export type DynamicField = {
  key: string;
  type: DynamicFieldType;
  label: LocalizedString;
  required: boolean;
  options?: LocalizedString[];
};

export type AdImage = {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  order: number;
};

export type JwtPayload = {
  sub: string;
  role: UserRole;
  email?: string;
  phone?: string;
};

export type SessionUser = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  image?: string;
  role: UserRole;
  isBanned: boolean;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: PaginationMeta;
};

export type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type AdListQuery = {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  q?: string;
  sort?: SortOption;
  page?: number;
  limit?: number;
  status?: AdStatus;
  sellerId?: string;
  featured?: boolean;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  condition?: AdCondition;
};

export type {
  AdCondition,
  AdStatus,
  NotificationType,
  OtpChannel,
  OtpPurpose,
  ReportStatus,
  ReportTargetType,
  SortOption,
  UserRole,
};
