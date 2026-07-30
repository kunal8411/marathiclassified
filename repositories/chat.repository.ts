import mongoose from "mongoose";
import { ChatModel, type ChatDocument } from "@/models/Chat";
import { serialize, type Serialized } from "./serialize";

export type SerializedChat = Omit<Serialized<ChatDocument>, "unread"> & {
  unread?: Record<string, number>;
};

type ChatLeanDoc = {
  _id: mongoose.Types.ObjectId;
  unread?: unknown;
} & Omit<ChatDocument, "_id" | "unread">;

function normalizeUnread(unread: unknown): Record<string, number> | undefined {
  if (!unread) return undefined;
  if (unread instanceof Map) {
    return Object.fromEntries(unread.entries()) as Record<string, number>;
  }
  if (typeof unread === "object") {
    return unread as Record<string, number>;
  }
  return undefined;
}

function toSerializedChat(doc: ChatLeanDoc | null): SerializedChat | null {
  if (!doc) return null;
  const base = serialize(doc);
  if (!base) return null;
  const { unread: _ignored, ...rest } = base as Serialized<ChatDocument>;
  return {
    ...rest,
    unread: normalizeUnread(doc.unread),
  };
}

export async function findOrCreate(
  adId: string,
  participantIds: string[],
): Promise<SerializedChat> {
  const ids = [...new Set(participantIds)].map((id) => new mongoose.Types.ObjectId(id));
  const existing = await ChatModel.findOne({
    adId: new mongoose.Types.ObjectId(adId),
    participants: { $all: ids },
    $expr: { $eq: [{ $size: "$participants" }, ids.length] },
  }).lean();

  if (existing) {
    return toSerializedChat(existing as ChatLeanDoc) as SerializedChat;
  }

  const created = await ChatModel.create({
    adId: new mongoose.Types.ObjectId(adId),
    participants: ids,
  });
  return toSerializedChat(created.toObject() as ChatLeanDoc) as SerializedChat;
}

export async function listForUser(
  userId: string,
  page: number,
  limit: number,
): Promise<{ items: SerializedChat[]; total: number }> {
  const uid = new mongoose.Types.ObjectId(userId);
  const filter = { participants: uid };
  const skip = (page - 1) * limit;
  const [docs, total] = await Promise.all([
    ChatModel.find(filter).sort({ lastMessageAt: -1 }).skip(skip).limit(limit).lean(),
    ChatModel.countDocuments(filter),
  ]);
  const items = docs.map((doc) => toSerializedChat(doc as ChatLeanDoc) as SerializedChat);
  return { items, total };
}

export async function findById(id: string): Promise<SerializedChat | null> {
  if (!mongoose.isValidObjectId(id)) return null;
  const doc = await ChatModel.findById(id).lean();
  return toSerializedChat(doc as ChatLeanDoc | null);
}

export async function updateLastMessage(
  id: string,
  preview: string,
  at: Date,
): Promise<SerializedChat | null> {
  if (!mongoose.isValidObjectId(id)) return null;
  const doc = await ChatModel.findByIdAndUpdate(
    id,
    { $set: { lastMessagePreview: preview, lastMessageAt: at } },
    { new: true },
  ).lean();
  return toSerializedChat(doc as ChatLeanDoc | null);
}

export async function adjustUnread(
  id: string,
  userId: string,
  delta: number,
): Promise<SerializedChat | null> {
  if (!mongoose.isValidObjectId(id)) return null;
  const key = `unread.${userId}`;
  const doc = await ChatModel.findByIdAndUpdate(
    id,
    delta === 0 ? { $set: { [key]: 0 } } : { $inc: { [key]: delta } },
    { new: true },
  ).lean();
  return toSerializedChat(doc as ChatLeanDoc | null);
}

export async function isParticipant(chatId: string, userId: string): Promise<boolean> {
  if (!mongoose.isValidObjectId(chatId)) return false;
  const count = await ChatModel.countDocuments({
    _id: chatId,
    participants: new mongoose.Types.ObjectId(userId),
  });
  return count > 0;
}

export async function findManyByIds(ids: string[]): Promise<SerializedChat[]> {
  const objectIds = ids.filter((id) => mongoose.isValidObjectId(id)).map((id) => new mongoose.Types.ObjectId(id));
  if (!objectIds.length) return [];
  const docs = await ChatModel.find({ _id: { $in: objectIds } }).lean();
  return docs.map((doc) => toSerializedChat(doc as ChatLeanDoc) as SerializedChat);
}
