import "server-only"

import type { ProviderName } from "../db/schema"
import * as dbWorkouts from "../db/workouts"
import { fetchInvictusWorkout } from "./invictus"
import { fetchLinchpinWorkout } from "./linchpin"
import { fetchPushjerkWorkout } from "./pushjerk"
import { ScraperError } from "./utils"

type ScraperFn = (date: string) => Promise<string[]>

const scrapers: Record<ProviderName, ScraperFn> = {
  invictus: fetchInvictusWorkout,
  pushjerk: fetchPushjerkWorkout,
  linchpin: fetchLinchpinWorkout,
}

export async function getWorkout(providerName: ProviderName, date: string) {
  // Check cache first
  const cached = await dbWorkouts.getProviderWorkout(date, providerName)
  if (cached) return cached

  // Scrape from provider
  const scraper = scrapers[providerName]
  const content = await scraper(date)

  // Cache and return
  return dbWorkouts.createProviderWorkout(content, date, providerName)
}

export { ScraperError }
