import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Suspense } from "react"
import { I18nProvider } from "@/lib/i18n/context"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"

export const metadata: Metadata = {
  title: "AgriSmart - Comprehensive Crop & Soil Management System",
  description:
    "AI-powered agricultural platform for smart crop selection, soil health management, disease detection, weather intelligence, and market connections. Empowering farmers with data-driven decisions.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
          `}</style>
        </head>
        <body className="antialiased">
          <Suspense fallback={null}>
            <I18nProvider>
              <TooltipProvider>
                {children}
                <Toaster />
              </TooltipProvider>
            </I18nProvider>
          </Suspense>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
