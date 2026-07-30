import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const favoriteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    adId: { type: Schema.Types.ObjectId, ref: "Ad", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

favoriteSchema.index({ userId: 1, adId: 1 }, { unique: true });
favoriteSchema.index({ userId: 1, createdAt: -1 });

export type FavoriteDocument = InferSchemaType<typeof favoriteSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const FavoriteModel: Model<FavoriteDocument> =
  mongoose.models.Favorite ??
  mongoose.model<FavoriteDocument>("Favorite", favoriteSchema);
