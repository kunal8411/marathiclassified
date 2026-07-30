import { create } from "zustand";

type ChatUiState = {
  activeChatId: string | null;
  typingByChat: Record<string, boolean>;
  setActiveChatId: (id: string | null) => void;
  setTyping: (chatId: string, typing: boolean) => void;
};

export const useChatUiStore = create<ChatUiState>((set) => ({
  activeChatId: null,
  typingByChat: {},
  setActiveChatId: (activeChatId) => set({ activeChatId }),
  setTyping: (chatId, typing) =>
    set((state) => ({
      typingByChat: { ...state.typingByChat, [chatId]: typing },
    })),
}));
