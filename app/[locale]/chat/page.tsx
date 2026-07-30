import { setRequestLocale } from "next-intl/server";

import type { Locale } from "@/config/site";
import { ChatList } from "@/features/chat/chat-list";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ChatIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Messages</h1>
      <ChatList locale={locale as Locale} />
    </div>
  );
}
