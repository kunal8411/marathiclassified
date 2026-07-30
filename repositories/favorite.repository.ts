import mongoose from "mongoose";
import { FavoriteModel, type FavoriteDocument } from "@/models/Favorite";
import { serialize, serializeMany, type Serialized } from "./serialize";

export type SerializedFavorite = Serialized<FavoriteDocument>;

export async function add(userId: string, adId: string): Promise<SerializedFavorite> {
  const doc = await FavoriteModel.findOneAndUpdate(
    {
      userId: new mongoose.Types.ObjectId(userId),
      adId: new mongoose.Types.ObjectId(adId),
    },
    {},
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();
  if (!doc) {
    const created = await FavoriteModel.create({
      userId: new mongoose.Types.ObjectId(userId),
      adId: new mongoose.Types.ObjectId(adId),
    });
    return serialize(created.toObject()) as SerializedFavorite;
  }
  return serialize(doc) as SerializedFavorite;
}

export async function remove(userId: string, adId: string): Promise<boolean> {
  const result = await FavoriteModel.deleteOne({
    userId: new mongoose.Types.ObjectId(userId),
    adId: new mongoose.Types.ObjectId(adId),
  });
  return result.deletedCount > 0;
}

export async function listByUser(
  userId: string,
  page: number,
  limit: number,
): Promise<{ items: SerializedFavorite[]; total: number }> {
  const filter = { userId: new mongoose.Types.ObjectId(userId) };
  const skip = (page - 1) * limit;
  const [docs, total] = await Promise.all([
    FavoriteModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    FavoriteModel.countDocuments(filter),
  ]);
  return { items: serializeMany(docs), total };
}

export async function exists(userId: string, adId: string): Promise<boolean> {
  const count = await FavoriteModel.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
    adId: new mongoose.Types.ObjectId(adId),
  });
  return count > 0;
}
