import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Source_Sans_3 as Source_Sans_Pro } from "next/font/google"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "700"],
})

const sourceSans = Source_Sans_Pro({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans",
  weight: ["400", "600"],
})

export const metadata: Metadata = {
  title: "CATA Volunteer Central",
  description: "Volunteer opportunity platform for CATA high school students",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${sourceSans.style.fontFamily};
  --font-serif: ${playfair.variable};
  --font-sans: ${sourceSans.variable};
}
        `}</style>
      </head>
      <body className={`${playfair.variable} ${sourceSans.variable} antialiased`}>{children}</body>
    </html>
  )
}
