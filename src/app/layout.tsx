import { ClerkProvider } from "@clerk/nextjs"
import { Geist, Geist_Mono } from "next/font/google"
import Link from "next/link"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

import { cn } from "@/lib/utils"

import "./globals.css"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata = {
  title: "Daily Workout",
  description: "Daily workout tracker",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={cn(
          "antialiased",
          fontSans.variable,
          "font-mono",
          fontMono.variable,
        )}
      >
        <body>
          <ThemeProvider>
            <TooltipProvider>
              <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <nav className="border-b px-4 py-3 sm:px-6">
                  <div className="mx-auto flex max-w-2xl items-center gap-6">
                    <Link href="/" className="text-lg font-bold">
                      Workout
                    </Link>
                    <Link
                      href="/programs"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Programs
                    </Link>
                  </div>
                </nav>
                <main className="flex-1">{children}</main>
              </div>
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
