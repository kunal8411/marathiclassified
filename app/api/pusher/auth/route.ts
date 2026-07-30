import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/api/handler";
import { ForbiddenError } from "@/lib/api/errors";
import { fail } from "@/lib/api/response";
import { getPusherServer } from "@/lib/pusher/server";
import * as chatRepo from "@/repositories/chat.repository";

export const POST = createApiHandler({
  auth: true,
  handler: async ({ req, user }) => {
    const form = await req.formData();
    const socketId = String(form.get("socket_id") ?? "");
    const channelName = String(form.get("channel_name") ?? "");

    if (!socketId || !channelName) {
      return fail("Missing socket_id or channel_name", 400);
    }

    if (channelName.startsWith("private-user-")) {
      const channelUserId = channelName.slice("private-user-".length);
      if (channelUserId !== user!.id) {
        throw new ForbiddenError("Not allowed to subscribe to this channel");
      }
    } else if (channelName.startsWith("private-chat-")) {
      const chatId = channelName.slice("private-chat-".length);
      const allowed = await chatRepo.isParticipant(chatId, user!.id);
      if (!allowed) {
        throw new ForbiddenError("Not allowed to subscribe to this channel");
      }
    } else {
      throw new ForbiddenError("Unknown channel");
    }

    const pusher = getPusherServer();
    if (!pusher) {
      return NextResponse.json({ auth: "" });
    }

    const auth = pusher.authorizeChannel(socketId, channelName);
    return NextResponse.json(auth);
  },
});
