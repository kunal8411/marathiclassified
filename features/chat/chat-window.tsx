"use client";

import * as React from "react";
import { Send } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { useMarkChatRead, useSendTyping } from "@/hooks/use-chat";
import { useMessages, useSendMessage } from "@/hooks/use-messages";
import { useChatUiStore } from "@/stores/chat-ui-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/shared/loading-state";
import { MessageBubble } from "@/features/chat/message-bubble";
import { TypingIndicator } from "@/features/chat/typing-indicator";

type ChatWindowProps = {
  chatId: string;
};

export function ChatWindow({ chatId }: ChatWindowProps) {
  const { data: auth } = useAuth();
  const { data, isLoading } = useMessages(chatId);
  const sendMessage = useSendMessage(chatId);
  const markRead = useMarkChatRead(chatId);
  const sendTyping = useSendTyping(chatId);
  const typing = useChatUiStore((s) => s.typingByChat[chatId]);
  const [text, setText] = React.useState("");
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    markRead.mutate();
  }, [chatId]);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.items.length]);

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setText("");
    await sendMessage.mutateAsync(body);
  };

  if (isLoading) return <LoadingState label="Loading messages…" />;

  const messages = data?.items ?? [];

  return (
    <div className="flex h-[min(70vh,640px)] flex-col rounded-xl border bg-card">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            body={msg.body}
            isOwn={String(msg.senderId) === auth?.id}
            createdAt={msg.createdAt}
          />
        ))}
        {typing ? <TypingIndicator /> : null}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={onSend} className="flex gap-2 border-t p-3">
        <Input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            sendTyping.mutate(true);
          }}
          placeholder="Type a message…"
        />
        <Button type="submit" size="icon" disabled={sendMessage.isPending}>
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
