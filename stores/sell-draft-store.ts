import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AdImage } from "@/types";

export type SellDraftStep = "category" | "details" | "media" | "review";

export type SellDraftState = {
  step: SellDraftStep;
  draftId?: string;
  categoryId?: string;
  subcategoryId?: string;
  title: string;
  description: string;
  price: number | "";
  city: string;
  area: string;
  condition?: "new" | "used";
  images: AdImage[];
  attributes: Record<string, unknown>;
  setStep: (step: SellDraftStep) => void;
  setDraftId: (id: string) => void;
  patch: (data: Partial<Omit<SellDraftState, "setStep" | "setDraftId" | "patch" | "reset">>) => void;
  reset: () => void;
};

const initial = {
  step: "category" as SellDraftStep,
  draftId: undefined,
  categoryId: undefined,
  subcategoryId: undefined,
  title: "",
  description: "",
  price: "" as const,
  city: "",
  area: "",
  condition: undefined,
  images: [] as AdImage[],
  attributes: {} as Record<string, unknown>,
};

export const useSellDraftStore = create<SellDraftState>()(
  persist(
    (set) => ({
      ...initial,
      setStep: (step) => set({ step }),
      setDraftId: (draftId) => set({ draftId }),
      patch: (data) => set(data),
      reset: () => set(initial),
    }),
    { name: "mc-sell-draft" },
  ),
);
