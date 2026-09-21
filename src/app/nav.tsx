"use client"

import { Dumbbell } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const links = [
  { href: "/training", label: "Training" },
  { href: "/wod", label: "Daily" },
  { href: "/programs", label: "Programs" },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav
      className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3 sm:px-6 lg:max-w-3xl">
        <div className="flex items-center gap-6">
          <Link
            href="/training"
            className="flex items-center gap-2 text-primary"
          >
            <Dumbbell className="h-5 w-5" />
            <span className="text-sm font-bold tracking-wider uppercase">
              Built to Move
            </span>
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => {
              const isActive = pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
