import "./globals.css"
import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Inter } from "next/font/google"
import { Providers } from "./providers"

export const metadata: Metadata = {
  title: {
    default: "Nossa Grana",
    template: "%s | Nossa Grana",
  },
  description: "Gerenciamento financeiro familiar",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
  },
}

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
