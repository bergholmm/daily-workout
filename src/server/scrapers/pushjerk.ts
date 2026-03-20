import type { HTMLElement } from "node-html-parser"
import { parse } from "node-html-parser"

import { PUSHJERK } from "./selectors"
import {
  BREAK,
  SEPARATOR,
  ScraperError,
  elementToText,
  fetchPage,
} from "./utils"

const daysOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
const months = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
]

function getUrl(date: string): string {
  const d = new Date(date)
  const dayOfWeek = daysOfWeek[d.getUTCDay()]
  const month = months[d.getUTCMonth()]
  const day = String(d.getUTCDate())
  const year = d.getUTCFullYear()
  return `https://pushjerk.com/${dayOfWeek}-${month}-${day}-${year}/`
}

/**
 * Check if a paragraph starts a new section.
 * PushJerk section headers look like: <p><strong>Warm-up<br/></strong>...</p>
 * Non-headers that are bold use: <p><strong><em>Rest 5 min...</em></strong></p>
 */
function isSectionHeader(p: HTMLElement): boolean {
  const firstChild = p.childNodes[0]
  if (!firstChild || firstChild.nodeType !== 1) return false

  const el = firstChild as HTMLElement
  if (el.tagName !== "STRONG") return false

  // Section headers have direct text in <strong>; non-headers wrap text in <em>
  const firstStrongChild = el.childNodes[0]
  return !!firstStrongChild && firstStrongChild.nodeType === 3
}

export async function fetchPushjerkWorkout(date: string): Promise<string[]> {
  const url = getUrl(date)
  const html = await fetchPage(url)
  const root = parse(html)

  const content = root.querySelector(PUSHJERK.content)
  if (!content) {
    throw new ScraperError(`No content found at ${url}`, "parse")
  }

  const paragraphs = Array.from(content.querySelectorAll(PUSHJERK.paragraphs))
  const workout: string[] = []
  let hasContent = false

  for (const p of paragraphs) {
    const lines = elementToText(p)
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)

    if (!lines.length) continue

    if (hasContent) {
      // Section headers get a full separator; other paragraphs get a break
      workout.push(isSectionHeader(p) ? SEPARATOR : BREAK)
    }

    workout.push(...lines)
    hasContent = true
  }

  if (!workout.length) {
    throw new ScraperError("Empty PushJerk workout", "not_found")
  }

  if (workout.join("").includes(PUSHJERK.notFoundText)) {
    throw new ScraperError(
      "PushJerk workout not found for " + date,
      "not_found",
    )
  }

  return workout
}
