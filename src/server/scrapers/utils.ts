import type { HTMLElement } from "node-html-parser"

export type ScraperErrorType = "network" | "parse" | "not_found"

export class ScraperError extends Error {
  type: ScraperErrorType

  constructor(message: string, type: ScraperErrorType) {
    super(message)
    this.name = "ScraperError"
    this.type = type
  }
}

export const SEPARATOR = "==="

export async function fetchPage(url: string): Promise<string> {
  let res: Response
  try {
    res = await fetch(url)
  } catch (err) {
    throw new ScraperError(`Failed to fetch ${url}: ${err}`, "network")
  }

  if (!res.ok) {
    throw new ScraperError(`HTTP ${res.status} for ${url}`, "network")
  }

  return res.text()
}

export function extractTextFromElements(
  elements: HTMLElement[],
  options: { separateBetween?: boolean } = {},
): string[] {
  const { separateBetween = true } = options

  return elements
    .flatMap((el, index, arr) => {
      const lines = el.textContent
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)

      if (separateBetween && index < arr.length - 1) {
        return [...lines, SEPARATOR]
      }
      return lines
    })
    .flat()
}
