"use client"

import * as React from "react"
import { Theme as PayloadTheme, ThemeProvider as PayloadThemeProvider } from '@payloadcms/ui'
import { ThemeProvider as NextThemesProvider } from "next-themes"

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: 'light' | 'dark' | 'system'
}

export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme={defaultTheme}>
      <ThemeSync>{children}</ThemeSync>
    </NextThemesProvider>
  )
}

// Separate component to handle theme syncing
function ThemeSync({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light')

  React.useEffect(() => {
    setMounted(true)
    // Check system preference
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(isDark ? 'dark' : 'light')
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <PayloadThemeProvider theme={theme}>
      {children}
    </PayloadThemeProvider>
  )
}
