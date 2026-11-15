"use client"

import { type ReactNode, useEffect, useState } from "react"
import { type Cache, SWRConfig, useSWRConfig } from "swr"

const STORAGE_KEY = "swr-cache-v1"

type Entry = [key: string, data: unknown]

export function readStoredEntries(storage: Pick<Storage, "getItem">): Entry[] {
  try {
    const entries: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? "[]")
    return Array.isArray(entries) ? (entries as Entry[]) : []
  } catch {
    return []
  }
}

export function storableEntries(cache: Cache): Entry[] {
  return [...cache.keys()].flatMap((key) => {
    const data = cache.get(key)?.data
    return key.startsWith("/api/") && data !== undefined ? [[key, data]] : []
  })
}

// Keeps API responses in localStorage so a page you have seen renders at
// once with its last data while SWR revalidates it. Stored data loads after
// hydration, so server and client render the same first frame.
export function SWRCacheProvider({ children }: { children: ReactNode }) {
  const [cache] = useState<Cache>(() => new Map())

  useEffect(() => {
    for (const [key, data] of readStoredEntries(localStorage)) {
      if (!cache.get(key)) cache.set(key, { data })
    }

    function save() {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(storableEntries(cache)),
        )
      } catch {
        // Storage can be full or disabled; the in-memory cache still works.
      }
    }
    function saveWhenHidden() {
      if (document.visibilityState === "hidden") save()
    }

    document.addEventListener("visibilitychange", saveWhenHidden)
    window.addEventListener("pagehide", save)
    return () => {
      document.removeEventListener("visibilitychange", saveWhenHidden)
      window.removeEventListener("pagehide", save)
    }
  }, [cache])

  return <SWRConfig value={{ provider: () => cache }}>{children}</SWRConfig>
}

// Drops cached data so the next person to sign in on this device never sees it.
export function ClearCachedData() {
  const { cache } = useSWRConfig()

  useEffect(() => {
    localStorage.removeItem(STORAGE_KEY)
    for (const key of [...cache.keys()]) cache.delete(key)
  }, [cache])

  return null
}
