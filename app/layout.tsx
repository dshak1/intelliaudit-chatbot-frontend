import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

export const metadata: Metadata = {
  title: "IntelliAudit | Evidence-Backed ISO 27001 Review",
  description: "Control-based compliance review with cited evidence, structured challenge, and human sign-off.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className="antialiased [font-family:'Avenir_Next','SF_Pro_Display','Segoe_UI',sans-serif]"
        suppressHydrationWarning
      >
        {children}
        <Analytics />
      </body>
    </html>
  )
}
