import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import type { AdStatus } from "@/constants";

const imageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    width: Number,
    height: Number,
    order: { type: Number, default: 0 },
  },
  { _id: false },
);

const locationSchema = new Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
    city: String,
    area: String,
    state: { type: String, default: "Maharashtra" },
  },
  { _id: false },
);

const adSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, required: true, maxlength: 5000 },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    subcategoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    images: { type: [imageSchema], default: [] },
    attributes: { type: Schema.Types.Mixed, default: {} },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    location: { type: locationSchema, required: true },
    status: {
      type: String,
      enum: ["draft", "pending", "active", "rejected", "sold", "archived"],
      default: "draft",
      index: true,
    },
    rejectionReason: String,
    isFeatured: { type: Boolean, default: false },
    featuredUntil: Date,
    views: { type: Number, default: 0 },
    favoritesCount: { type: Number, default: 0 },
    condition: { type: String, enum: ["new", "used"] },
    publishedAt: Date,
  },
  { timestamps: true },
);

adSchema.index({ status: 1, categoryId: 1, price: 1 });
adSchema.index({ status: 1, publishedAt: -1 });
adSchema.index({ location: "2dsphere" });
adSchema.index({ sellerId: 1, status: 1 });
adSchema.index({ isFeatured: 1, status: 1 });
adSchema.index({ title: "text", description: "text" });

export type AdDocument = InferSchemaType<typeof adSchema> & {
  _id: mongoose.Types.ObjectId;
  status: AdStatus;
};

export const AdModel: Model<AdDocument> =
  mongoose.models.Ad ?? mongoose.model<AdDocument>("Ad", adSchema);
