
import type React from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { FontProvider } from "@/components/font-provider"

export const metadata = {
  title: "MakeItReel - AI Video Generator",
  description: "Transform YouTube videos into AI-powered Shorts and Reels",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <FontProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        </FontProvider>
      </body>
    </html>
  )
}
