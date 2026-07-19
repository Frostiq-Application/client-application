import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { STORAGE_KEYS } from "@/constants/app.constants";
import { setToken } from "@/lib/authToken";
import type { CustomerProfile } from "@/types/domain.types";

interface AuthState {
  token: string | null;
  customer: CustomerProfile | null;
  isAuthenticated: boolean;
  signIn: (token: string, customer: CustomerProfile) => void;
  setCustomer: (customer: CustomerProfile) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      customer: null,
      isAuthenticated: false,
      signIn: (token, customer) => {
        setToken(token);
        set({ token, customer, isAuthenticated: true });
      },
      setCustomer: (customer) => set({ customer }),
      signOut: () => {
        setToken(null);
        set({ token: null, customer: null, isAuthenticated: false });
      },
    }),
    {
      name: STORAGE_KEYS.AUTH,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ token: s.token, customer: s.customer }),
      onRehydrateStorage: () => (state) => {
        // Keep the network-layer token bridge in sync after refresh.
        if (state?.token) {
          setToken(state.token);
          state.isAuthenticated = true;
        }
      },
    },
  ),
);
