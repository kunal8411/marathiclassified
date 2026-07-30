import Pusher from "pusher";

let pusher: Pusher | null = null;

export function getPusherServer(): Pusher | null {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER ?? "ap2";

  if (!appId || !key || !secret) return null;

  if (!pusher) {
    pusher = new Pusher({ appId, key, secret, cluster, useTLS: true });
  }
  return pusher;
}

export async function triggerChatEvent(
  chatId: string,
  event: string,
  data: Record<string, unknown>,
): Promise<void> {
  const server = getPusherServer();
  if (!server) {
    console.info(`[DEV PUSHER] chat=${chatId} event=${event}`, data);
    return;
  }
  await server.trigger(`private-chat-${chatId}`, event, data);
}

export async function triggerUserEvent(
  userId: string,
  event: string,
  data: Record<string, unknown>,
): Promise<void> {
  const server = getPusherServer();
  if (!server) {
    console.info(`[DEV PUSHER] user=${userId} event=${event}`, data);
    return;
  }
  await server.trigger(`private-user-${userId}`, event, data);
}
