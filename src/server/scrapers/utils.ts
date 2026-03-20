import type { HTMLElement, Node } from "node-html-parser"

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
export const BREAK = "---"

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

/** Convert an element's content to text, preserving links as markdown. */
export function elementToText(el: HTMLElement): string {
  let text = ""
  for (const child of el.childNodes as Node[]) {
    if (child.nodeType === 3) {
      // Text node
      text += child.text
    } else if (child.nodeType === 1) {
      const childEl = child as HTMLElement
      if (childEl.tagName === "A") {
        const href = childEl.getAttribute("href")
        const linkText = childEl.textContent.trim()
        if (href && linkText) {
          text += `[${linkText}](${href})`
        } else {
          text += childEl.textContent
        }
      } else if (childEl.tagName === "BR") {
        text += "\n"
      } else {
        // Recurse into nested elements (strong, em, etc.)
        text += elementToText(childEl)
      }
    }
  }
  return text
}

export function extractTextFromElements(
  elements: HTMLElement[],
  options: { separateBetween?: boolean } = {},
): string[] {
  const { separateBetween = true } = options

  return elements
    .flatMap((el, index, arr) => {
      const lines = elementToText(el)
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
