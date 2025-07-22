"use client"

import type { ThemeProviderProps } from "next-themes"
import  { dark } from "@clerk/themes";

import * as React from "react"
import { HeroUIProvider } from "@heroui/system"
import { useRouter } from "next/navigation"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ToastProvider } from "@heroui/toast"
import { ClerkProvider } from "@clerk/nextjs"

export interface ProvidersProps {
  children: React.ReactNode
  themeProps?: ThemeProviderProps
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter()

  return (
    <ClerkProvider localization={{locale: "ptBR"}} appearance={{ baseTheme: dark }} afterSignOutUrl="/">
      <HeroUIProvider locale="pt-BR" navigate={router.push}>
        <ToastProvider />
        <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
      </HeroUIProvider>
    </ClerkProvider>
  )
}
