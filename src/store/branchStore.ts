import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { STORAGE_KEYS } from "@/constants/app.constants";

/**
 * The customer's chosen branch (shop). All catalog/cart/order calls are scoped
 * to this shopId. Persisted so returning users skip branch selection.
 */
interface BranchState {
  selectedShopId: string | null;
  selectBranch: (shopId: string) => void;
  clearBranch: () => void;
}

export const useBranchStore = create<BranchState>()(
  persist(
    (set) => ({
      selectedShopId: null,
      selectBranch: (shopId) => set({ selectedShopId: shopId }),
      clearBranch: () => set({ selectedShopId: null }),
    }),
    {
      name: STORAGE_KEYS.BRANCH,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
