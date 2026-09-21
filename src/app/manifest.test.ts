import { describe, expect, it } from "vitest"

import manifest from "./manifest"

describe("web app manifest", () => {
  it("keeps every application route inside the standalone Home Screen app", () => {
    expect(manifest()).toMatchObject({
      name: "Daily Workout",
      short_name: "Workout",
      start_url: "/training",
      scope: "/",
      display: "standalone",
      background_color: "#171719",
      theme_color: "#171719",
      icons: expect.arrayContaining([
        expect.objectContaining({
          src: "/favicon.ico",
          sizes: "any",
          type: "image/x-icon",
        }),
      ]),
    })
  })
})
