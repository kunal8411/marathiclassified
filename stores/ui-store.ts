import { create } from "zustand";

type UiState = {
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  searchSheetOpen: boolean;
  setSearchSheetOpen: (open: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  mobileNavOpen: false,
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  searchSheetOpen: false,
  setSearchSheetOpen: (searchSheetOpen) => set({ searchSheetOpen }),
}));
