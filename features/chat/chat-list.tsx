"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import type { Locale } from "@/config/site";
import { cn } from "@/lib/utils";
import { useChats } from "@/hooks/use-chat";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";

type ChatListProps = {
  locale: Locale;
  activeId?: string;
  className?: string;
};

export function ChatList({ locale, activeId, className }: ChatListProps) {
  const { data: auth } = useAuth();
  const { data, isLoading, isError } = useChats();

  if (isLoading) return <LoadingState label="Loading chats…" />;
  if (isError) return <p className="text-sm text-destructive">Could not load chats</p>;
  if (!data?.items.length) {
    return <EmptyState title="No messages yet" description="Start a chat from a listing." />;
  }

  return (
    <ul className={cn("divide-y rounded-xl border bg-card", className)}>
      {data.items.map((chat) => {
        const unread = auth?.id ? chat.unread?.[auth.id] ?? 0 : 0;
        const label = `Chat ${String(chat.adId).slice(-6)}`;
        return (
          <li key={chat.id}>
            <Link
              href={`/${locale}/chat/${chat.id}`}
              className={cn(
                "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
                activeId === chat.id && "bg-primary/5",
              )}
            >
              <Avatar className="size-10">
                <AvatarImage src="" alt="" />
                <AvatarFallback>{label.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{label}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {chat.lastMessageAt
                    ? formatDistanceToNow(new Date(chat.lastMessageAt), { addSuffix: true })
                    : "No messages"}
                </p>
              </div>
              {unread > 0 ? (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {unread}
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
