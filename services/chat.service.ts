import { ForbiddenError, NotFoundError } from "@/lib/api/errors";
import { sanitizeText } from "@/lib/security/xss";
import { triggerChatEvent, triggerUserEvent } from "@/lib/pusher/server";
import { siteConfig } from "@/config/site";
import type { PaginationMeta } from "@/types";
import * as adRepo from "@/repositories/ad.repository";
import * as chatRepo from "@/repositories/chat.repository";
import * as messageRepo from "@/repositories/message.repository";
import * as notificationRepo from "@/repositories/notification.repository";
import type { SerializedChat } from "@/repositories/chat.repository";
import type { SerializedMessage } from "@/repositories/message.repository";

function paginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

async function assertParticipant(chatId: string, userId: string): Promise<SerializedChat> {
  const chat = await chatRepo.findById(chatId);
  if (!chat) throw new NotFoundError("Chat not found");
  const participantIds = chat.participants.map((p) => String(p));
  if (!participantIds.includes(userId)) {
    throw new ForbiddenError("Not a participant in this chat");
  }
  return chat;
}

export async function startChat(adId: string, buyerId: string): Promise<SerializedChat> {
  const ad = await adRepo.findById(adId);
  if (!ad || ad.status !== "active") {
    throw new NotFoundError("Ad not found");
  }
  const sellerId = String(ad.sellerId);
  if (sellerId === buyerId) {
    throw new ForbiddenError("Cannot start a chat on your own ad");
  }
  return chatRepo.findOrCreate(adId, [buyerId, sellerId]);
}

export async function listChats(
  userId: string,
  page = 1,
  limit = siteConfig.pageSize,
): Promise<{ items: SerializedChat[]; meta: PaginationMeta }> {
  const { items, total } = await chatRepo.listForUser(userId, page, limit);
  return { items, meta: paginationMeta(page, limit, total) };
}

export async function getMessages(
  chatId: string,
  userId: string,
  page = 1,
  limit = 50,
): Promise<{ items: SerializedMessage[]; meta: PaginationMeta }> {
  await assertParticipant(chatId, userId);
  const { items, total } = await messageRepo.listByChat(chatId, page, limit);
  return { items, meta: paginationMeta(page, limit, total) };
}

export type SendMessageInput = {
  body: string;
  attachments?: { url?: string; publicId?: string }[];
};

export async function sendMessage(
  chatId: string,
  senderId: string,
  input: SendMessageInput,
): Promise<SerializedMessage> {
  const chat = await assertParticipant(chatId, senderId);
  const body = sanitizeText(input.body);
  const message = await messageRepo.create({
    chatId,
    senderId,
    body,
    attachments: input.attachments,
  });

  const preview = body.length > 120 ? `${body.slice(0, 117)}...` : body;
  await chatRepo.updateLastMessage(chatId, preview, new Date());

  const recipientIds = chat.participants.map((p) => String(p)).filter((id) => id !== senderId);
  await Promise.all(
    recipientIds.map((recipientId) => chatRepo.adjustUnread(chatId, recipientId, 1)),
  );

  await triggerChatEvent(chatId, "new_message", {
    messageId: message.id,
    chatId,
    senderId,
    body: message.body,
    createdAt: message.createdAt,
  });

  for (const recipientId of recipientIds) {
    await notificationRepo.create({
      userId: recipientId,
      type: "new_message",
      title: "New message",
      body: preview,
      data: { chatId, messageId: message.id },
    });
    await triggerUserEvent(recipientId, "new_message", { chatId, messageId: message.id });
  }

  return message;
}

export async function markRead(chatId: string, userId: string): Promise<{ read: number }> {
  await assertParticipant(chatId, userId);
  const read = await messageRepo.markRead(chatId, userId);
  await chatRepo.adjustUnread(chatId, userId, 0);
  return { read };
}

export async function typing(chatId: string, userId: string, isTyping: boolean): Promise<void> {
  await assertParticipant(chatId, userId);
  await triggerChatEvent(chatId, "typing", { userId, isTyping });
}
