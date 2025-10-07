"use client"

import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    if (typeof document !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"))
    }
  }, [])

  function toggle() {
    if (typeof document === "undefined") return
    document.documentElement.classList.toggle("dark")
    setIsDark((d) => !d)
  }

  return (
    <Button
      variant="outline"
      onClick={toggle}
      aria-pressed={isDark}
      title={isDark ? "Switch to light" : "Switch to dark"}
    >
      {isDark ? "Light Mode" : "Dark Mode"}
    </Button>
  )
}
