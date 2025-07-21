import { Nunito_Sans, Poppins, Staatliches } from "next/font/google"

export const fontHeading = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-heading",
})

export const fontMono = Staatliches({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mono",
})

export const fontSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})
