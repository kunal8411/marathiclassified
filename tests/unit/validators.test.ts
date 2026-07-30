import { describe, expect, it } from "vitest";
import { generateOtp, formatPrice, slugify, cn } from "@/utils";
import { loginSchema, registerSchema, createAdSchema } from "@/validators";
import { AppError, ValidationError } from "@/lib/api/errors";

describe("utils", () => {
  it("generates otp of given length", () => {
    expect(generateOtp(6)).toHaveLength(6);
  });

  it("formats INR price", () => {
    expect(formatPrice(1500)).toContain("1,500");
  });

  it("slugifies titles", () => {
    expect(slugify("Hello World!")).toBe("hello-world");
  });

  it("merges class names", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});

describe("validators", () => {
  it("accepts valid login with email", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects register without email or phone", () => {
    const result = registerSchema.safeParse({
      name: "Kunal",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("validates ad payload", () => {
    const result = createAdSchema.safeParse({
      title: "iPhone 13 for sale",
      description: "Excellent condition phone with box and charger included.",
      price: 35000,
      categoryId: "507f1f77bcf86cd799439011",
      images: [],
      attributes: {},
      location: {
        coordinates: [73.8567, 18.5204],
        city: "Pune",
        state: "Maharashtra",
      },
    });
    expect(result.success).toBe(true);
  });
});

describe("errors", () => {
  it("creates typed app errors", () => {
    const err = new ValidationError("bad", { field: "email" });
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(422);
    expect(err.code).toBe("VALIDATION_ERROR");
  });
});
