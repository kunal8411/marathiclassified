import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const ratingSchema = new Schema(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    raterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
  },
  { timestamps: true },
);

ratingSchema.index({ sellerId: 1, raterId: 1 }, { unique: true });

export type RatingDocument = InferSchemaType<typeof ratingSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const RatingModel: Model<RatingDocument> =
  mongoose.models.Rating ?? mongoose.model<RatingDocument>("Rating", ratingSchema);
