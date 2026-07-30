import mongoose from "mongoose";
import { MessageModel, type MessageDocument } from "@/models/Message";
import { serialize, serializeMany, type Serialized } from "./serialize";

export type SerializedMessage = Serialized<MessageDocument>;

export type CreateMessageInput = {
  chatId: string;
  senderId: string;
  body: string;
  attachments?: { url?: string; publicId?: string }[];
};

export async function create(input: CreateMessageInput): Promise<SerializedMessage> {
  const doc = await MessageModel.create({
    chatId: new mongoose.Types.ObjectId(input.chatId),
    senderId: new mongoose.Types.ObjectId(input.senderId),
    body: input.body,
    attachments: input.attachments ?? [],
    readBy: [new mongoose.Types.ObjectId(input.senderId)],
  });
  return serialize(doc.toObject()) as SerializedMessage;
}

export async function listByChat(
  chatId: string,
  page: number,
  limit: number,
): Promise<{ items: SerializedMessage[]; total: number }> {
  if (!mongoose.isValidObjectId(chatId)) {
    return { items: [], total: 0 };
  }
  const filter = { chatId: new mongoose.Types.ObjectId(chatId) };
  const skip = (page - 1) * limit;
  const [docs, total] = await Promise.all([
    MessageModel.find(filter).sort({ createdAt: 1 }).skip(skip).limit(limit).lean(),
    MessageModel.countDocuments(filter),
  ]);
  return { items: serializeMany(docs), total };
}

export async function markRead(chatId: string, userId: string): Promise<number> {
  if (!mongoose.isValidObjectId(chatId) || !mongoose.isValidObjectId(userId)) return 0;
  const uid = new mongoose.Types.ObjectId(userId);
  const result = await MessageModel.updateMany(
    {
      chatId: new mongoose.Types.ObjectId(chatId),
      senderId: { $ne: uid },
      readBy: { $ne: uid },
    },
    { $addToSet: { readBy: uid } },
  );
  return result.modifiedCount;
}

export async function countSince(start: Date): Promise<number> {
  return MessageModel.countDocuments({ createdAt: { $gte: start } });
}
