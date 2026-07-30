import mongoose, { type FilterQuery, type PipelineStage } from "mongoose";
import { AdModel, type AdDocument } from "@/models/Ad";
import type { AdCondition, AdListQuery, AdStatus, SortOption } from "@/types";
import { siteConfig } from "@/config/site";
import { serialize, serializeMany, type Serialized } from "./serialize";

export type SerializedAd = Serialized<AdDocument>;

export type CreateAdInput = {
  title: string;
  description: string;
  price: number;
  currency?: string;
  categoryId: string;
  subcategoryId?: string;
  images?: AdDocument["images"];
  attributes?: Record<string, unknown>;
  sellerId: string;
  location: AdDocument["location"];
  status?: AdStatus;
  condition?: AdCondition;
  isFeatured?: boolean;
  featuredUntil?: Date;
  publishedAt?: Date;
};

export type UpdateAdInput = Partial<
  Omit<CreateAdInput, "sellerId" | "categoryId" | "subcategoryId">
> & {
  categoryId?: string;
  subcategoryId?: string;
  rejectionReason?: string;
};

export type ListAdsResult = {
  items: SerializedAd[];
  total: number;
};

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildListFilter(query: AdListQuery): FilterQuery<AdDocument> {
  const filter: FilterQuery<AdDocument> = {};

  if (query.status) {
    filter.status = query.status;
  } else if (!query.sellerId) {
    filter.status = "active";
  }

  if (query.categoryId && mongoose.isValidObjectId(query.categoryId)) {
    filter.categoryId = new mongoose.Types.ObjectId(query.categoryId);
  }
  if (query.sellerId && mongoose.isValidObjectId(query.sellerId)) {
    filter.sellerId = new mongoose.Types.ObjectId(query.sellerId);
  }
  if (query.minPrice != null || query.maxPrice != null) {
    filter.price = {};
    if (query.minPrice != null) filter.price.$gte = query.minPrice;
    if (query.maxPrice != null) filter.price.$lte = query.maxPrice;
  }
  if (query.city) {
    filter["location.city"] = new RegExp(`^${escapeRegex(query.city)}$`, "i");
  }
  if (query.condition) {
    filter.condition = query.condition;
  }
  if (query.featured === true) {
    filter.isFeatured = true;
    filter.status = "active";
  }

  if (query.lat != null && query.lng != null && query.radiusKm != null) {
    filter.location = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [query.lng, query.lat],
        },
        $maxDistance: query.radiusKm * 1000,
      },
    };
  }

  return filter;
}

function buildSort(sort: SortOption | undefined, useTextScore: boolean): Record<string, 1 | -1 | { $meta: string }> {
  if (useTextScore && sort === "relevance") {
    return { score: { $meta: "textScore" }, publishedAt: -1 };
  }
  switch (sort) {
    case "oldest":
      return { publishedAt: 1, createdAt: 1 };
    case "price_asc":
      return { price: 1 };
    case "price_desc":
      return { price: -1 };
    case "newest":
    default:
      return { publishedAt: -1, createdAt: -1 };
  }
}

export async function create(input: CreateAdInput): Promise<SerializedAd> {
  const doc = await AdModel.create({
    ...input,
    categoryId: new mongoose.Types.ObjectId(input.categoryId),
    subcategoryId: input.subcategoryId
      ? new mongoose.Types.ObjectId(input.subcategoryId)
      : undefined,
    sellerId: new mongoose.Types.ObjectId(input.sellerId),
  });
  return serialize(doc.toObject()) as SerializedAd;
}

export async function updateById(id: string, input: UpdateAdInput): Promise<SerializedAd | null> {
  if (!mongoose.isValidObjectId(id)) return null;
  const { categoryId, subcategoryId, ...rest } = input;
  const $set: Record<string, unknown> = { ...rest };
  if (categoryId) $set.categoryId = new mongoose.Types.ObjectId(categoryId);
  if (subcategoryId) $set.subcategoryId = new mongoose.Types.ObjectId(subcategoryId);

  const doc = await AdModel.findByIdAndUpdate(id, { $set }, { new: true }).lean();
  return serialize(doc) ?? null;
}

export async function findById(id: string): Promise<SerializedAd | null> {
  if (!mongoose.isValidObjectId(id)) return null;
  const doc = await AdModel.findById(id).lean();
  return serialize(doc) ?? null;
}

export async function deleteById(id: string): Promise<boolean> {
  if (!mongoose.isValidObjectId(id)) return false;
  const result = await AdModel.deleteOne({ _id: id });
  return result.deletedCount > 0;
}

export async function list(query: AdListQuery): Promise<ListAdsResult> {
  const page = query.page ?? 1;
  const limit = query.limit ?? siteConfig.pageSize;
  const skip = (page - 1) * limit;
  const filter = buildListFilter(query);

  if (query.q?.trim()) {
    return searchText(query.q.trim(), {
      page,
      limit,
      categoryId: query.categoryId,
      status: (filter.status as AdStatus | undefined) ?? "active",
      sort: query.sort,
    });
  }

  const sort = buildSort(query.sort, false);
  const [docs, total] = await Promise.all([
    AdModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    AdModel.countDocuments(filter),
  ]);
  return { items: serializeMany(docs), total };
}

export async function findFeatured(limit: number): Promise<SerializedAd[]> {
  const now = new Date();
  const docs = await AdModel.find({
    status: "active",
    isFeatured: true,
    $or: [{ featuredUntil: { $gte: now } }, { featuredUntil: { $exists: false } }, { featuredUntil: null }],
  })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean();
  return serializeMany(docs);
}

export async function findNearby(
  lat: number,
  lng: number,
  radiusKm: number,
  page: number,
  limit: number,
): Promise<ListAdsResult> {
  const filter: FilterQuery<AdDocument> = {
    status: "active",
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: radiusKm * 1000,
      },
    },
  };
  const skip = (page - 1) * limit;
  const [docs, total] = await Promise.all([
    AdModel.find(filter).skip(skip).limit(limit).lean(),
    AdModel.countDocuments(filter),
  ]);
  return { items: serializeMany(docs), total };
}

export async function searchText(
  q: string,
  options: {
    page?: number;
    limit?: number;
    categoryId?: string;
    status?: AdStatus;
    sort?: SortOption;
  } = {},
): Promise<ListAdsResult> {
  const page = options.page ?? 1;
  const limit = options.limit ?? siteConfig.pageSize;
  const skip = (page - 1) * limit;
  const status = options.status ?? "active";

  const baseFilter: FilterQuery<AdDocument> = { status };
  if (options.categoryId && mongoose.isValidObjectId(options.categoryId)) {
    baseFilter.categoryId = new mongoose.Types.ObjectId(options.categoryId);
  }

  try {
    const textFilter: FilterQuery<AdDocument> = {
      ...baseFilter,
      $text: { $search: q },
    };
    const sort = buildSort(options.sort ?? "relevance", true);
    const [docs, total] = await Promise.all([
      AdModel.find(textFilter, { score: { $meta: "textScore" } })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      AdModel.countDocuments(textFilter),
    ]);
    if (total > 0) {
      return { items: serializeMany(docs), total };
    }
  } catch {
    // fall through to regex
  }

  const regex = new RegExp(escapeRegex(q), "i");
  const regexFilter: FilterQuery<AdDocument> = {
    ...baseFilter,
    $or: [{ title: regex }, { description: regex }],
  };
  const [docs, total] = await Promise.all([
    AdModel.find(regexFilter).sort({ publishedAt: -1 }).skip(skip).limit(limit).lean(),
    AdModel.countDocuments(regexFilter),
  ]);
  return { items: serializeMany(docs), total };
}

export async function searchAtlas(
  q: string,
  options: {
    page?: number;
    limit?: number;
    categoryId?: string;
  } = {},
): Promise<ListAdsResult> {
  const page = options.page ?? 1;
  const limit = options.limit ?? siteConfig.pageSize;
  const skip = (page - 1) * limit;

  const matchAfterSearch: Record<string, unknown> = { status: "active" };
  if (options.categoryId && mongoose.isValidObjectId(options.categoryId)) {
    matchAfterSearch.categoryId = new mongoose.Types.ObjectId(options.categoryId);
  }

  try {
    const pipeline: PipelineStage[] = [
      {
        $search: {
          index: "default",
          text: {
            query: q,
            path: ["title", "description"],
          },
        },
      },
      { $match: matchAfterSearch },
      { $addFields: { score: { $meta: "searchScore" } } },
      { $sort: { score: -1, publishedAt: -1 } },
      {
        $facet: {
          items: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: "count" }],
        },
      },
    ];

    const [facetResult] = await AdModel.aggregate(pipeline);
    const items = (facetResult?.items ?? []) as AdDocument[];
    const total = (facetResult?.total?.[0]?.count as number | undefined) ?? 0;
    return { items: serializeMany(items), total };
  } catch {
    return searchText(q, {
      page,
      limit,
      categoryId: options.categoryId,
      status: "active",
      sort: "relevance",
    });
  }
}

export async function incrementViews(id: string): Promise<void> {
  if (!mongoose.isValidObjectId(id)) return;
  await AdModel.updateOne({ _id: id }, { $inc: { views: 1 } });
}

export async function incrementFavorites(id: string, delta: 1 | -1): Promise<void> {
  if (!mongoose.isValidObjectId(id)) return;
  await AdModel.updateOne({ _id: id }, { $inc: { favoritesCount: delta } });
}

export async function countByStatus(): Promise<Record<AdStatus, number>> {
  const rows = await AdModel.aggregate<{ _id: AdStatus; count: number }>([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const result = {} as Record<AdStatus, number>;
  for (const row of rows) {
    result[row._id] = row.count;
  }
  return result;
}
