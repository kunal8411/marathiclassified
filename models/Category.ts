import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import type { DynamicField } from "@/types";

const localizedSchema = new Schema(
  {
    en: { type: String, required: true },
    mr: { type: String, required: true },
  },
  { _id: false },
);

const dynamicFieldSchema = new Schema(
  {
    key: { type: String, required: true },
    type: { type: String, enum: ["text", "number", "select", "boolean"], required: true },
    label: { type: localizedSchema, required: true },
    required: { type: Boolean, default: false },
    options: [localizedSchema],
  },
  { _id: false },
);

const categorySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true },
    name: { type: localizedSchema, required: true },
    icon: { type: String, default: "tag" },
    parentId: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    fieldSchema: { type: [dynamicFieldSchema], default: [] },
  },
  { timestamps: true },
);

categorySchema.index({ parentId: 1, order: 1 });
categorySchema.index({ isActive: 1 });

export type CategoryDocument = InferSchemaType<typeof categorySchema> & {
  _id: mongoose.Types.ObjectId;
  fieldSchema: DynamicField[];
};

export const CategoryModel: Model<CategoryDocument> =
  mongoose.models.Category ??
  mongoose.model<CategoryDocument>("Category", categorySchema);
