"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/client";

interface Message {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
  sender?: {
    name: string;
    image?: string;
  };
}

interface ChatThreadProps {
  locale: string;
  currentUserId?: string;
  sellerId: string;
  sellerName: string;
  sellerImage?: string;
  adId?: string;
}

export function ChatThread({
  locale,
  currentUserId,
  sellerId,
  sellerName,
  sellerImage,
  adId,
}: ChatThreadProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMarathi = locale === "mr";

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load messages
  const loadMessages = useCallback(async () => {
    try {
      const res = await apiFetch("/api/chats", {
        method: "GET",
      });

      if (res.success && Array.isArray(res.data)) {
        // Filter to messages with this seller
        const chatWithSeller = res.data.find(
          (chat: Record<string, unknown>) =>
            Array.isArray(chat.participants) &&
            (chat.participants as string[]).includes(sellerId) &&
            (chat.participants as string[]).includes(currentUserId || "")
        );

        if (chatWithSeller) {
          const messagesRes = await apiFetch(
            `/api/chats/${(chatWithSeller as { id: string }).id}/messages`,
            { method: "GET" }
          );
          if (messagesRes.success) {
            setMessages((messagesRes.data as { items?: Message[] })?.items || []);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }, [sellerId, currentUserId]);

  // Load messages on mount and poll
  useEffect(() => {
    loadMessages();
    // Poll for new messages every 2 seconds
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, [loadMessages]);


  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentUserId) {
      toast.error(isMarathi ? "संदेश रिकामा आहे" : "Message cannot be empty");
      return;
    }

    setLoading(true);
    try {
      // First, ensure a chat exists with this seller
      const chatRes = await apiFetch("/api/chats", {
        method: "POST",
        body: {
          participantId: sellerId,
          adId: adId,
        },
      });

      if (!chatRes.success) {
        throw new Error(chatRes.error.message);
      }

      const chatId = (chatRes.data as { id: string }).id;

      // Send the message
      const messageRes = await apiFetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        body: {
          body: inputValue,
        },
      });

      if (messageRes.success) {
        setInputValue("");
        await loadMessages();
        toast.success(isMarathi ? "संदेश पाठवला" : "Message sent");
      } else {
        throw new Error(messageRes.error.message);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : isMarathi ? "पाठवणे अयशस्वी" : "Failed to send"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-[600px] flex-col bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center gap-3 border-b p-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={sellerImage} alt={sellerName} />
          <AvatarFallback className="bg-orange-100 text-orange-600">
            {sellerName[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold">{sellerName}</h3>
          <p className="text-xs text-slate-500">{isMarathi ? "ऑनलाइन" : "Online"}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-slate-500">
            <p>
              {isMarathi
                ? "अजून कोणतेही संदेश नाहीत. संभाषण सुरू करा!"
                : "No messages yet. Start the conversation!"}
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.senderId === currentUserId ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-lg px-3 py-2 max-w-xs ${
                  msg.senderId === currentUserId
                    ? "bg-orange-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                }`}
              >
                <p className="text-sm">{msg.body}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4 space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder={isMarathi ? "संदेश टाइप करा..." : "Type a message..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={loading || !inputValue.trim()}
            size="sm"
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isMarathi ? "पाठवण्यासाठी Enter दाबा" : "Press Enter to send"}
        </p>
      </div>
    </div>
  );
}
