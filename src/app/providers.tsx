"use client"

import type { ThemeProviderProps } from "next-themes"
import { ThemeProvider as NextThemesProvider } from "next-themes"

import * as React from "react"
import { HeroUIProvider } from "@heroui/system"
import { useRouter } from "next/navigation"
import { ToastProvider } from "@heroui/toast"

export interface ProvidersProps {
  children: React.ReactNode
  themeProps?: ThemeProviderProps
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter()

  return (
    <HeroUIProvider locale="pt-BR" navigate={router.push}>
      <ToastProvider />
      <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
    </HeroUIProvider>
  )
}
