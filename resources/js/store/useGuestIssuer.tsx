import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface GuestIssuerState {
  loggedIn: boolean;
  name: string;
  email: string;
  setLoggedIn: (loggedIn: boolean) => void;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  clearUser: () => void;
}

const useGuestIssuerStore = create<GuestIssuerState>()(
  persist(
    (set) => ({
      loggedIn: false,
      name: "",
      email: "",
      setLoggedIn: (loggedIn) => set({ loggedIn }),
      setName: (name) => set({ name }),
      setEmail: (email) => set({ email }),
      clearUser: () => set({ name: "", email: "" , loggedIn : false }),
    }),
    {
        name: 'PINOKIO-GUEST-USER',
        storage: createJSONStorage(() => localStorage)
    }
  )
);

export default useGuestIssuerStore;
