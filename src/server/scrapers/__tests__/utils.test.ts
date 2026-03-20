import { parse } from "node-html-parser"
import { describe, expect, it } from "vitest"

import { SEPARATOR, ScraperError, extractTextFromElements } from "../utils"

describe("ScraperError", () => {
  it("has correct type and message", () => {
    const err = new ScraperError("test error", "network")
    expect(err.message).toBe("test error")
    expect(err.type).toBe("network")
    expect(err.name).toBe("ScraperError")
  })

  it("supports all error types", () => {
    expect(new ScraperError("", "network").type).toBe("network")
    expect(new ScraperError("", "parse").type).toBe("parse")
    expect(new ScraperError("", "not_found").type).toBe("not_found")
  })
})

describe("extractTextFromElements", () => {
  it("extracts text from paragraphs with separators between them", () => {
    const root = parse("<div><p>Line 1</p><p>Line 2</p><p>Line 3</p></div>")
    const elements = Array.from(root.querySelectorAll("p"))
    const result = extractTextFromElements(elements)
    expect(result).toEqual(["Line 1", SEPARATOR, "Line 2", SEPARATOR, "Line 3"])
  })

  it("splits multiline text content", () => {
    const root = parse("<div><p>Line 1\nLine 2</p></div>")
    const elements = Array.from(root.querySelectorAll("p"))
    const result = extractTextFromElements(elements)
    expect(result).toEqual(["Line 1", "Line 2"])
  })

  it("trims whitespace from lines", () => {
    const root = parse("<div><p>  Hello  </p></div>")
    const elements = Array.from(root.querySelectorAll("p"))
    const result = extractTextFromElements(elements)
    expect(result).toEqual(["Hello"])
  })

  it("filters empty lines", () => {
    const root = parse("<div><p>A\n\nB</p></div>")
    const elements = Array.from(root.querySelectorAll("p"))
    const result = extractTextFromElements(elements)
    expect(result).toEqual(["A", "B"])
  })

  it("can disable separators between elements", () => {
    const root = parse("<div><p>A</p><p>B</p></div>")
    const elements = Array.from(root.querySelectorAll("p"))
    const result = extractTextFromElements(elements, { separateBetween: false })
    expect(result).toEqual(["A", "B"])
  })

  it("returns empty array for no elements", () => {
    const result = extractTextFromElements([])
    expect(result).toEqual([])
  })

  it("preserves links as markdown", () => {
    const root = parse(
      '<div><p>10 <a href="https://www.youtube.com/watch?v=abc">Wall Balls</a> (20/14)</p></div>',
    )
    const elements = Array.from(root.querySelectorAll("p"))
    const result = extractTextFromElements(elements)
    expect(result).toEqual([
      "10 [Wall Balls](https://www.youtube.com/watch?v=abc) (20/14)",
    ])
  })

  it("preserves multiple links in one element", () => {
    const root = parse(
      '<div><p><a href="https://youtube.com/1">Ex A</a> and <a href="https://youtube.com/2">Ex B</a></p></div>',
    )
    const elements = Array.from(root.querySelectorAll("p"))
    const result = extractTextFromElements(elements)
    expect(result).toEqual([
      "[Ex A](https://youtube.com/1) and [Ex B](https://youtube.com/2)",
    ])
  })

  it("handles nested strong/em tags with links", () => {
    const root = parse(
      '<div><p><strong>Warm-up</strong></p><p>Do <a href="https://example.com">this</a></p></div>',
    )
    const elements = Array.from(root.querySelectorAll("p"))
    const result = extractTextFromElements(elements)
    expect(result).toEqual([
      "Warm-up",
      SEPARATOR,
      "Do [this](https://example.com)",
    ])
  })
})
