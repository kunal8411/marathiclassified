import type { SessionUser, UserRole } from "@/types";
import { ForbiddenError, UnauthorizedError } from "@/lib/api/errors";

export function assertAuthenticated(user: SessionUser | null): asserts user is SessionUser {
  if (!user) throw new UnauthorizedError();
}

export function assertRole(user: SessionUser | null, roles: UserRole[]): void {
  assertAuthenticated(user);
  if (!roles.includes(user.role)) {
    throw new ForbiddenError("Insufficient permissions");
  }
}

export function assertAdmin(user: SessionUser | null): void {
  assertRole(user, ["admin"]);
}

export function assertOwnerOrAdmin(
  user: SessionUser | null,
  ownerId: string,
): void {
  assertAuthenticated(user);
  if (user.role !== "admin" && user.id !== ownerId) {
    throw new ForbiddenError("Not allowed");
  }
}
