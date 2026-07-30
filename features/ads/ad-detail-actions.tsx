"use client";

import Link from "next/link";
import { Heart, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import type { Locale } from "@/config/site";
import { useAuth } from "@/hooks/use-auth";
import { useStartChat } from "@/hooks/use-ad";
import { useToggleFavorite } from "@/hooks/use-favorites";
import { Button } from "@/components/ui/button";

type AdDetailActionsProps = {
  locale: Locale;
  adId: string;
  sellerId: string;
};

export function AdDetailActions({ locale, adId, sellerId }: AdDetailActionsProps) {
  const { data: user } = useAuth();
  const startChat = useStartChat();
  const toggleFavorite = useToggleFavorite(adId);
  const isOwner = user?.id === sellerId;

  const onChat = async () => {
    if (!user) {
      toast.error("Log in to message the seller");
      return;
    }
    try {
      const chat = await startChat.mutateAsync(adId);
      window.location.href = `/${locale}/chat/${chat.id}`;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start chat");
    }
  };

  const onFavorite = async () => {
    if (!user) {
      toast.error("Log in to save favorites");
      return;
    }
    try {
      await toggleFavorite.mutateAsync(false);
      toast.success("Saved to favorites");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {!isOwner ? (
        <Button className="gap-2" onClick={onChat} disabled={startChat.isPending}>
          <MessageSquare className="size-4" />
          Chat with seller
        </Button>
      ) : null}
      <Button variant="outline" className="gap-2" onClick={onFavorite}>
        <Heart className="size-4" />
        Save
      </Button>
      <Button variant="ghost" asChild>
        <Link href={`/${locale}/sellers/${sellerId}`}>View seller</Link>
      </Button>
    </div>
  );
}
