import mongoose from "mongoose";
import { NotificationModel, type NotificationDocument } from "@/models/Notification";
import type { NotificationType } from "@/types";
import { serialize, serializeMany, type Serialized } from "./serialize";

export type SerializedNotification = Serialized<NotificationDocument>;

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

export async function create(input: CreateNotificationInput): Promise<SerializedNotification> {
  const doc = await NotificationModel.create({
    userId: new mongoose.Types.ObjectId(input.userId),
    type: input.type,
    title: input.title,
    body: input.body,
    data: input.data ?? {},
  });
  return serialize(doc.toObject()) as SerializedNotification;
}

export async function listByUser(
  userId: string,
  page: number,
  limit: number,
  unreadOnly?: boolean,
): Promise<{ items: SerializedNotification[]; total: number }> {
  const filter: {
    userId: mongoose.Types.ObjectId;
    readAt?: { $exists: false };
  } = {
    userId: new mongoose.Types.ObjectId(userId),
  };
  if (unreadOnly) {
    filter.readAt = { $exists: false };
  }
  const skip = (page - 1) * limit;
  const [docs, total] = await Promise.all([
    NotificationModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    NotificationModel.countDocuments(filter),
  ]);
  return { items: serializeMany(docs), total };
}

export async function markRead(id: string, userId: string): Promise<SerializedNotification | null> {
  if (!mongoose.isValidObjectId(id)) return null;
  const doc = await NotificationModel.findOneAndUpdate(
    { _id: id, userId: new mongoose.Types.ObjectId(userId), readAt: { $exists: false } },
    { $set: { readAt: new Date() } },
    { new: true },
  ).lean();
  return serialize(doc) ?? null;
}

export async function markAllRead(userId: string): Promise<number> {
  const result = await NotificationModel.updateMany(
    { userId: new mongoose.Types.ObjectId(userId), readAt: { $exists: false } },
    { $set: { readAt: new Date() } },
  );
  return result.modifiedCount;
}
