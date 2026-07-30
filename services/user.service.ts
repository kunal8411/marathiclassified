import { ForbiddenError, NotFoundError, ValidationError } from "@/lib/api/errors";
import { sanitizeOptionalText, sanitizeText } from "@/lib/security/xss";
import { triggerUserEvent } from "@/lib/pusher/server";
import type { GeoPoint } from "@/types";
import * as userRepo from "@/repositories/user.repository";
import * as ratingRepo from "@/repositories/rating.repository";
import type { SerializedUser } from "@/repositories/user.repository";

export type PublicProfile = Pick<
  SerializedUser,
  "id" | "name" | "image" | "bio" | "location" | "rating" | "createdAt"
>;

export type UpdateProfileInput = {
  name?: string;
  bio?: string;
  image?: string;
  location?: GeoPoint;
};

export type RateSellerInput = {
  sellerId: string;
  raterId: string;
  score: number;
  comment?: string;
};

export async function getPublicProfile(userId: string): Promise<PublicProfile> {
  const user = await userRepo.findById(userId);
  if (!user) throw new NotFoundError("User not found");
  if (user.isBanned) throw new NotFoundError("User not found");

  return {
    id: user.id,
    name: user.name,
    image: user.image,
    bio: user.bio,
    location: user.location,
    rating: user.rating,
    createdAt: user.createdAt,
  };
}

export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<PublicProfile> {
  const user = await userRepo.findById(userId);
  if (!user) throw new NotFoundError("User not found");
  if (user.isBanned) throw new ForbiddenError("Account is banned");

  const name = input.name != null ? sanitizeText(input.name) : undefined;
  const bio = input.bio != null ? sanitizeOptionalText(input.bio) : undefined;

  const updated = await userRepo.updateById(userId, {
    name,
    bio,
    image: input.image,
    location: input.location,
    lastActiveAt: new Date(),
  });

  if (!updated) throw new NotFoundError("User not found");

  return getPublicProfile(updated.id);
}

export async function rateSeller(input: RateSellerInput): Promise<{ rating: PublicProfile["rating"] }> {
  if (input.sellerId === input.raterId) {
    throw new ValidationError("You cannot rate yourself");
  }

  const seller = await userRepo.findById(input.sellerId);
  if (!seller || seller.isBanned) {
    throw new NotFoundError("Seller not found");
  }

  const rater = await userRepo.findById(input.raterId);
  if (!rater || rater.isBanned) {
    throw new ForbiddenError("Account is banned");
  }

  await ratingRepo.upsert({
    sellerId: input.sellerId,
    raterId: input.raterId,
    score: input.score,
    comment: input.comment ? sanitizeOptionalText(input.comment) : undefined,
  });

  const aggregate = await ratingRepo.aggregateForSeller(input.sellerId);
  await userRepo.updateRating(input.sellerId, aggregate.avg, aggregate.count);

  await triggerUserEvent(input.sellerId, "new_rating", {
    avg: aggregate.avg,
    count: aggregate.count,
  });

  return { rating: { avg: aggregate.avg, count: aggregate.count } };
}
