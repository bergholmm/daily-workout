import { parse } from "node-html-parser"

import { LINCHPIN } from "./selectors"
import { SEPARATOR, ScraperError, fetchPage } from "./utils"

function getUrl(date: string): string {
  const [year, month, day] = date.split("-")
  return `https://crossfitlinchpin.com/blogs/wod/${month}-${day}-${year}-workout-of-the-day`
}

export async function fetchLinchpinWorkout(date: string): Promise<string[]> {
  const url = getUrl(date)
  const html = await fetchPage(url)
  const root = parse(html)

  const article = root.querySelector(LINCHPIN.article)
  if (!article) {
    throw new ScraperError(`No article found at ${url}`, "parse")
  }

  const spans = Array.from(article.querySelectorAll(LINCHPIN.content))
  const workout = spans
    .flatMap((s) => {
      const lines = s.textContent
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)

      return lines.length ? lines : [SEPARATOR]
    })
    .flat()
    .filter((l) => !l.includes(LINCHPIN.adText))

  if (!workout.length) {
    throw new ScraperError("Empty workout content", "not_found")
  }

  if (workout.join("").includes(LINCHPIN.restDay)) {
    throw new ScraperError("Rest day", "not_found")
  }

  return workout
}
