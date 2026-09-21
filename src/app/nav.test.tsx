import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { Nav } from "./nav"

vi.mock("next/navigation", () => ({
  usePathname: () => "/training",
}))

describe("Nav", () => {
  it("keeps the header below the iOS top safe area", () => {
    const html = renderToStaticMarkup(<Nav />)

    expect(html).toContain("padding-top:env(safe-area-inset-top, 0px)")
  })
})
