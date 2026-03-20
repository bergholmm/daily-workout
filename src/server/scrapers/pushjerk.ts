import { parse } from "node-html-parser"

import { PUSHJERK } from "./selectors"
import { ScraperError, extractTextFromElements, fetchPage } from "./utils"

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

export async function fetchPushjerkWorkout(date: string): Promise<string[]> {
  const url = getUrl(date)
  const html = await fetchPage(url)
  const root = parse(html)

  const content = root.querySelector(PUSHJERK.content)
  if (!content) {
    throw new ScraperError(`No content found at ${url}`, "parse")
  }

  const paragraphs = Array.from(content.querySelectorAll(PUSHJERK.paragraphs))
  const workout = extractTextFromElements(paragraphs)

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
