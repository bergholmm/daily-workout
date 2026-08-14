import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import type { Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { BottomNav } from "@/components/bottom-nav"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

import { cn } from "@/lib/utils"

import "./globals.css"
import { Nav } from "./nav"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata = {
  title: "Daily Workout",
  description: "Daily workout tracker",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
}

export const viewport: Viewport = {
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{ baseTheme: dark }}
      afterSignOutUrl="/sign-in"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
    >
      <html
        lang="en"
        suppressHydrationWarning
        className={cn("dark antialiased", fontSans.variable, fontMono.variable)}
      >
        <body>
          <ThemeProvider>
            <TooltipProvider>
              <div className="flex min-h-screen w-full flex-col">
                <Nav />
                <main className="flex-1">{children}</main>
              </div>
              <BottomNav />
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
