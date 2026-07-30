/** @vitest-environment node */
import { describe, expect, it, beforeAll } from "vitest";
import { signAccessToken, verifyAccessToken } from "@/lib/auth/jwt";

beforeAll(() => {
  process.env.JWT_ACCESS_SECRET = "test-access-secret-min-32-characters!!";
  process.env.JWT_REFRESH_SECRET = "test-refresh-secret-min-32-characters!";
});

describe("jwt", () => {
  it("signs and verifies access tokens", async () => {
    const token = await signAccessToken({
      sub: "507f1f77bcf86cd799439011",
      role: "user",
      email: "a@b.com",
    });
    const payload = await verifyAccessToken(token);
    expect(payload.sub).toBe("507f1f77bcf86cd799439011");
    expect(payload.role).toBe("user");
  });
});
