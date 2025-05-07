import { create } from "zustand"
import { persist } from "zustand/middleware"

interface LayoutState {
  sidebarOpen: boolean
  language: "en" | "ar"
  theme: "light" | "dark"
  toggleSidebar: () => void
  setLanguage: (language: "en" | "ar") => void
  setTheme: (theme: "light" | "dark") => void
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      language: "en",
      theme: "light",
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "layout-storage",
    },
  ),
)
