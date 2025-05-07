"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { useLayoutStore } from "@/store/useLayoutStore"

export function useThemeDetection() {
  const [mounted, setMounted] = useState(false)
  const { theme } = useLayoutStore()
  const { resolvedTheme } = useTheme()

  // After mounting, we have access to the theme
  useEffect(() => setMounted(true), [])

  return {
    mounted,
    isDark: mounted && (resolvedTheme === "dark" || theme === "dark"),
    theme: mounted ? resolvedTheme : theme,
  }
}
