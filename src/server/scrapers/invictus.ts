import { parse } from "node-html-parser"

import { INVICTUS } from "./selectors"
import { ScraperError, extractTextFromElements, fetchPage } from "./utils"

const monthMap: Record<string, string> = {
  "01": "january",
  "02": "february",
  "03": "march",
  "04": "april",
  "05": "may",
  "06": "june",
  "07": "july",
  "08": "august",
  "09": "september",
  "10": "october",
  "11": "november",
  "12": "december",
}

function getUrls(date: string): string[] {
  const d = new Date(date)
  const day = String(d.getUTCDate())
  const [year, month] = date.split("-")
  const monthName = monthMap[month!]
  const base = `https://www.crossfitinvictus.com/wod/${monthName}-${day}-${year}`
  return [`${base}-performance/`, `${base}-performance-fitness/`]
}

export async function fetchInvictusWorkout(date: string): Promise<string[]> {
  const urls = getUrls(date)

  for (const url of urls) {
    let html: string
    try {
      html = await fetchPage(url)
    } catch {
      continue
    }

    const root = parse(html)
    const content = root.querySelector(INVICTUS.content)
    if (!content) continue

    const paragraphs = Array.from(content.querySelectorAll(INVICTUS.paragraphs))
    const workout = extractTextFromElements(paragraphs)

    if (workout.length) return workout
  }

  throw new ScraperError("Invictus workout not found for " + date, "not_found")
}
