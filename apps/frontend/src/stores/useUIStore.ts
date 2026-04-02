import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark' | 'system';

interface UIState {
  isSidebarOpen: boolean;
  isSearchOpen: boolean;
  theme: ThemeMode;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setSearchOpen: (isOpen: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarOpen: false, 
      isSearchOpen: false,
      theme: 'dark', // default theme
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      setSearchOpen: (isOpen) => set({ isSearchOpen: isOpen }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'quantpulse-ui-storage',
      partialize: (state) => ({ theme: state.theme }), // Only persist the theme
    }
  )
);
