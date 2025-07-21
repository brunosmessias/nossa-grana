import "@/src/styles/globals.css"
import { Metadata, Viewport } from "next"

import { Providers } from "./providers"

import { siteConfig } from "@/src/config/site"
import { TRPCReactProvider } from "@/src/trpc/react"
import clsx from "clsx"
import { fontHeading, fontMono, fontSans } from "@/src/app/_components/layout/fonts"

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
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
    <html suppressHydrationWarning lang="en">
      <body className={clsx(
        "min-h-screen bg-background font-sans antialiased",
        fontHeading.className, fontMono.className, fontSans.className,
        )}>
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
  )
}
