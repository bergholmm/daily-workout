import { ClerkProvider } from '@clerk/nextjs'
import { Inter as FontSans } from 'next/font/google'

import { Layout } from '~/components/layout'
import { Toaster } from '~/components/ui/sonner'
import { TooltipProvider } from '~/components/ui/tooltip'

import { cn } from '~/lib/utils'

import '~/styles/globals.css'

import { CSPostHogProvider } from './_analytics/provider'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata = {
  title: 'Web-app-template',
  description: '',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <CSPostHogProvider>
        <TooltipProvider>
          <html lang="en">
            <body
              className={cn(
                'dark min-h-screen bg-background font-sans antialiased',
                fontSans.variable,
              )}
            >
              <Layout>{children}</Layout>
            </body>
            <Toaster />
          </html>
        </TooltipProvider>
      </CSPostHogProvider>
    </ClerkProvider>
  )
}
