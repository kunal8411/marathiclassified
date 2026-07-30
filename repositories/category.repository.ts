import mongoose from "mongoose";
import { CategoryModel, type CategoryDocument } from "@/models/Category";
import type { DynamicField, LocalizedString } from "@/types";
import { serialize, serializeMany, type Serialized } from "./serialize";

export type SerializedCategory = Serialized<CategoryDocument>;

export type CreateCategoryInput = {
  slug: string;
  name: LocalizedString;
  icon?: string;
  parentId?: string | null;
  order?: number;
  isActive?: boolean;
  fieldSchema?: DynamicField[];
};

export async function findAllActive(): Promise<SerializedCategory[]> {
  const docs = await CategoryModel.find({ isActive: true }).sort({ order: 1, slug: 1 }).lean();
  return docs.map((doc) => {
    const base = serialize(doc) as SerializedCategory & { parentId?: unknown };
    return {
      ...base,
      parentId: base.parentId ? String(base.parentId) : null,
    } as SerializedCategory;
  });
}

export async function findBySlug(slug: string): Promise<SerializedCategory | null> {
  const doc = await CategoryModel.findOne({ slug: slug.toLowerCase() }).lean();
  return serialize(doc) ?? null;
}

export async function findById(id: string): Promise<SerializedCategory | null> {
  if (!mongoose.isValidObjectId(id)) return null;
  const doc = await CategoryModel.findById(id).lean();
  return serialize(doc) ?? null;
}

export async function createMany(items: CreateCategoryInput[]): Promise<SerializedCategory[]> {
  const payload = items.map((item) => ({
    ...item,
    parentId: item.parentId ? new mongoose.Types.ObjectId(item.parentId) : null,
  }));
  const docs = await CategoryModel.insertMany(payload);
  return serializeMany(docs.map((d) => d.toObject()));
}
