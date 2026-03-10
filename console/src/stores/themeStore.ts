import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: 'light' }),
    }),
    {
      name: 'rofenclaw-theme',
    }
  )
)
