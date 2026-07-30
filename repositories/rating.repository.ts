import mongoose from "mongoose";
import { RatingModel, type RatingDocument } from "@/models/Rating";
import { serialize, serializeMany, type Serialized } from "./serialize";

export type SerializedRating = Serialized<RatingDocument>;

export type UpsertRatingInput = {
  sellerId: string;
  raterId: string;
  score: number;
  comment?: string;
};

export type SellerRatingAggregate = {
  avg: number;
  count: number;
};

export async function upsert(input: UpsertRatingInput): Promise<SerializedRating> {
  const doc = await RatingModel.findOneAndUpdate(
    {
      sellerId: new mongoose.Types.ObjectId(input.sellerId),
      raterId: new mongoose.Types.ObjectId(input.raterId),
    },
    {
      $set: {
        score: input.score,
        comment: input.comment,
      },
      $setOnInsert: {
        sellerId: new mongoose.Types.ObjectId(input.sellerId),
        raterId: new mongoose.Types.ObjectId(input.raterId),
      },
    },
    { upsert: true, new: true },
  ).lean();
  return serialize(doc) as SerializedRating;
}

export async function listBySeller(
  sellerId: string,
  page: number,
  limit: number,
): Promise<{ items: SerializedRating[]; total: number }> {
  const filter = { sellerId: new mongoose.Types.ObjectId(sellerId) };
  const skip = (page - 1) * limit;
  const [docs, total] = await Promise.all([
    RatingModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    RatingModel.countDocuments(filter),
  ]);
  return { items: serializeMany(docs), total };
}

export async function aggregateForSeller(sellerId: string): Promise<SellerRatingAggregate> {
  const [row] = await RatingModel.aggregate<{ avg: number; count: number }>([
    { $match: { sellerId: new mongoose.Types.ObjectId(sellerId) } },
    {
      $group: {
        _id: null,
        avg: { $avg: "$score" },
        count: { $sum: 1 },
      },
    },
  ]);
  if (!row) {
    return { avg: 0, count: 0 };
  }
  return {
    avg: Math.round(row.avg * 10) / 10,
    count: row.count,
  };
}
