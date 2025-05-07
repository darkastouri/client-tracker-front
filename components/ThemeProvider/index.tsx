"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { useLayoutStore } from "@/store/useLayoutStore"
import { useEffect } from "react"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const { theme, setTheme } = useLayoutStore()

  // Sync the theme with next-themes
  useEffect(() => {
    const handleThemeChange = (newTheme: string) => {
      if (newTheme === "light" || newTheme === "dark") {
        setTheme(newTheme)
      }
    }

    // Listen for theme changes from next-themes
    window.addEventListener("theme-change", (e: any) => {
      handleThemeChange(e.detail)
    })

    return () => {
      window.removeEventListener("theme-change", (e: any) => {
        handleThemeChange(e.detail)
      })
    }
  }, [setTheme])

  return (
    <NextThemesProvider attribute="class" defaultTheme={theme} enableSystem disableTransitionOnChange {...props}>
      {children}
    </NextThemesProvider>
  )
}
