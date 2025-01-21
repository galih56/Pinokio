import { create } from "zustand";

export type AlertDialogStoreType = {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm?: (() => void) | null; 
  onCancel?: (() => void) | null;
  openDialog: (options: Omit<AlertDialogStoreType, "isOpen" | "openDialog" | "closeDialog">) => void;
  closeDialog: () => void;
};

export const useGlobalAlertDialogStore = create<AlertDialogStoreType>((set) => ({
  isOpen: false,
  title: "",
  description: "",
  onConfirm: null,
  onCancel: null,
  openDialog: ({ title, description, onConfirm, onCancel }) =>
    set({ isOpen: true, title, description, onConfirm, onCancel }),
  closeDialog: () => set({ isOpen: false }),
}));
