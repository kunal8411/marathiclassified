import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/config/site";
import { ChatList } from "@/features/chat/chat-list";
import { ChatWindow } from "@/features/chat/chat-window";

type Props = {
  params: Promise<{ locale: string; chatId: string }>;
};

export default async function ChatThreadPage({ params }: Props) {
  const { locale, chatId } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="hidden lg:block">
          <ChatList locale={loc} activeId={chatId} />
        </div>
        <ChatWindow chatId={chatId} />
      </div>
    </div>
  );
}
