import { createApiHandler } from "@/lib/api/handler";
import { ok } from "@/lib/api/response";
import { updateProfileSchema } from "@/validators";
import type { GeoPoint } from "@/types";
import * as userService from "@/services/user.service";

export const GET = createApiHandler({
  auth: true,
  handler: async ({ user }) => {
    const data = await userService.getPublicProfile(user!.id);
    return ok(data);
  },
});

export const PATCH = createApiHandler({
  auth: true,
  bodySchema: updateProfileSchema,
  handler: async ({ user, body }) => {
    const location: GeoPoint | undefined = body.location
      ? { type: "Point", ...body.location }
      : undefined;
    const data = await userService.updateProfile(user!.id, {
      name: body.name,
      bio: body.bio,
      image: body.image,
      location,
    });
    return ok(data);
  },
});
