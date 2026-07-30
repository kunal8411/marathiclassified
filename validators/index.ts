import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2).max(120),
    email: z.string().email().optional(),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{7,14}$/)
      .optional(),
    password: z.string().min(8).max(128),
  })
  .refine((d) => Boolean(d.email || d.phone), {
    message: "Email or phone is required",
  });

export const loginSchema = z
  .object({
    email: z.string().email().optional(),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{7,14}$/)
      .optional(),
    password: z.string().min(8).max(128),
  })
  .refine((d) => Boolean(d.email || d.phone), {
    message: "Email or phone is required",
  });

export const otpSendSchema = z
  .object({
    channel: z.enum(["email", "phone"]),
    destination: z.string().min(3),
    purpose: z.enum(["register", "login", "verify"]),
    name: z.string().min(2).max(120).optional(),
    password: z.string().min(8).max(128).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.channel === "email" && !z.string().email().safeParse(data.destination).success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid email", path: ["destination"] });
    }
    if (
      data.channel === "phone" &&
      !/^\+?[1-9]\d{7,14}$/.test(data.destination)
    ) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid phone", path: ["destination"] });
    }
  });

export const otpVerifySchema = z.object({
  channel: z.enum(["email", "phone"]),
  destination: z.string().min(3),
  purpose: z.enum(["register", "login", "verify"]),
  code: z.string().length(6),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  bio: z.string().max(1000).optional(),
  image: z.string().url().optional(),
  location: z
    .object({
      coordinates: z.tuple([z.number(), z.number()]),
      city: z.string().optional(),
      area: z.string().optional(),
      state: z.string().optional(),
    })
    .optional(),
});

export const rateUserSchema = z.object({
  score: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export const adImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
  width: z.number().optional(),
  height: z.number().optional(),
  order: z.number().int().min(0).default(0),
});

export const createAdSchema = z.object({
  title: z.string().min(5).max(140),
  description: z.string().min(20).max(5000),
  price: z.number().min(0),
  categoryId: z.string().min(1),
  subcategoryId: z.string().optional(),
  images: z.array(adImageSchema).max(8).default([]),
  attributes: z.record(z.unknown()).default({}),
  location: z.object({
    coordinates: z.tuple([z.number(), z.number()]),
    city: z.string().min(1),
    area: z.string().optional(),
    state: z.string().default("Maharashtra"),
  }),
  condition: z.enum(["new", "used"]).optional(),
  status: z.enum(["draft", "pending"]).optional(),
});

export const updateAdSchema = createAdSchema.partial();

export const adListQuerySchema = z.object({
  categoryId: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  city: z.string().optional(),
  q: z.string().optional(),
  sort: z.enum(["newest", "oldest", "price_asc", "price_desc", "relevance"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z
    .enum(["draft", "pending", "active", "rejected", "sold", "archived"])
    .optional(),
  sellerId: z.string().optional(),
  featured: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radiusKm: z.coerce.number().optional(),
  condition: z.enum(["new", "used"]).optional(),
});

export const nearbyQuerySchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  radiusKm: z.coerce.number().default(25),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const searchQuerySchema = z.object({
  q: z.string().min(1),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  categoryId: z.string().optional(),
});

export const favoriteSchema = z.object({
  adId: z.string().min(1),
});

export const createChatSchema = z.object({
  adId: z.string().min(1),
});

export const sendMessageSchema = z.object({
  body: z.string().min(1).max(4000),
  attachments: z
    .array(z.object({ url: z.string().url(), publicId: z.string() }))
    .optional(),
});

export const createReportSchema = z.object({
  targetType: z.enum(["ad", "user"]),
  targetId: z.string().min(1),
  reason: z.string().min(3).max(200),
  details: z.string().max(2000).optional(),
});

export const adminRejectSchema = z.object({
  reason: z.string().min(3).max(500),
});

export const adminBanSchema = z.object({
  reason: z.string().min(3).max(500),
  banned: z.boolean().default(true),
});

export const updateReportSchema = z.object({
  status: z.enum(["open", "resolved", "dismissed"]),
});
