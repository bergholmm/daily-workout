"use client"

import { CalendarDays, LayoutList } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

const tabs = [
  { href: "/", label: "Today", icon: CalendarDays },
  { href: "/programs", label: "Programs", icon: LayoutList },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/50 bg-background/80 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-stretch">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground",
              )}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
