import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';       

interface ThemeState {
    theme : string; 
    toggleTheme: () => void;
    setTheme: (newTheme: string) => void;
};
  
const useThemeStore = create(
    persist<ThemeState>((set) => ({
        theme: localStorage.getItem('theme') || 'light', 
        toggleTheme: () => {
            set((state : any) => {
            const newTheme = state.theme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            return { theme: newTheme };
            });
        },
        setTheme: (newTheme : any) => {
            localStorage.setItem('theme', newTheme);
            set({ theme: newTheme });
        },
        }),
        {
          name: 'PINOKIO-THEME',
          storage: createJSONStorage(() => localStorage)
        }
    )
);

export default useThemeStore;