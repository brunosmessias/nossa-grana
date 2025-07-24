import "@/src/styles/globals.css"
import { Metadata, Viewport } from "next"

import { Providers } from "./providers"

import { TRPCReactProvider } from "@/src/trpc/react"
import {
  fontHeading,
  fontMono,
  fontSans,
} from "@/src/app/_components/layout/fonts"
import { dark } from "@clerk/themes"
import { ClerkProvider } from "@clerk/nextjs"
import { cn } from "@heroui/theme"

export const metadata: Metadata = {
  title: {
    default: "Nossa Grana",
    template: `%s - Nossa Grana`,
  },
  description:
    "Registre entradas e saídas, acompanhe metas, planeje gastos e compartilhe o orçamento com toda a família.",
  icons: {
    icon: "/favicon.ico",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      localization={{ locale: "ptBR" }}
      appearance={{ baseTheme: dark }}
      afterSignOutUrl="/"
    >
      <html suppressHydrationWarning lang="en">
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontHeading.variable,
            fontMono.variable,
            fontSans.variable
          )}
        >
          <TRPCReactProvider>
            <Providers
              themeProps={{
                attribute: "class",
                defaultTheme: "dark",
              }}
            >
              <main className="relative flex h-screen w-full flex-col">
                {children}
              </main>
            </Providers>
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
