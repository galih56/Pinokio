import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Define the store's state and actions
interface GuestIssuerState {
  name: string;
  email: string;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  clearUser: () => void;
}

const useGuestIssuerStore = create<GuestIssuerState>()(
  persist(
    (set) => ({
      name: "",
      email: "",
      setName: (name) => set({ name }),
      setEmail: (email) => set({ email }),
      clearUser: () => set({ name: "", email: "" }),
    }),
    {
        name: 'PINOKIO-GUEST-USER',
        storage: createJSONStorage(() => localStorage)
    }
  )
);

export default useGuestIssuerStore;
