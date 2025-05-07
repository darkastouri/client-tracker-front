"use client"

import { Button } from "@/components/ui/button"
import { useLayoutStore } from "@/store/useLayoutStore"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect } from "react"

export function ThemeSwitcher() {
  const { theme, setTheme } = useLayoutStore()
  const { setTheme: setNextTheme } = useTheme()

  // Sync the theme state with next-themes
  useEffect(() => {
    setNextTheme(theme)
  }, [theme, setNextTheme])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    setNextTheme(newTheme)
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
