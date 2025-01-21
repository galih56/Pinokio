import { create } from "zustand";

interface ImagePreviewerStore {
    selectedImage: string | null;
    setSelectedImage: (image: string | null) => void;
  }
  
export const useImagePreviewerStore = create<ImagePreviewerStore>((set) => ({
    selectedImage: null,
    setSelectedImage: (image) => set({ selectedImage: image }),
}));