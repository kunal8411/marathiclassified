import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { sanitizeText } from "@/lib/security/xss";
import { sanitizeObject } from "@/lib/security/sanitize";

describe("auth crypto", () => {
  it("hashes and verifies passwords", async () => {
    const hash = await hashPassword("Secret123!");
    expect(await verifyPassword("Secret123!", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
});

describe("security", () => {
  it("strips script tags from text", () => {
    expect(sanitizeText('<script>alert(1)</script>Hello')).toBe("Hello");
  });

  it("sanitizes mongo operators", () => {
    const input = { email: { $gt: "" }, name: "ok" };
    const cleaned = sanitizeObject(input);
    expect(JSON.stringify(cleaned)).not.toContain("$gt");
  });
});
