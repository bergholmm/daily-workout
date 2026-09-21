import { beforeEach, describe, expect, it, vi } from "vitest"

const protect = vi.fn()

type MiddlewareHandler = (
  auth: { protect: () => void },
  request: Request,
) => Promise<void>

const clerkMiddleware = vi.hoisted(() =>
  vi.fn((handler: MiddlewareHandler) => handler),
)

vi.mock("@clerk/nextjs/server", () => ({
  clerkMiddleware,
  createRouteMatcher: vi.fn((patterns: string[]) => {
    return (request: Request) => {
      const { pathname } = new URL(request.url)

      return patterns.some((pattern) => {
        if (pattern === pathname) return true
        if (!pattern.endsWith("(.*)")) return false

        const basePath = pattern.slice(0, -4)
        return pathname === basePath || pathname.startsWith(`${basePath}/`)
      })
    }
  }),
}))

describe("middleware", () => {
  beforeEach(() => {
    protect.mockReset()
  })

  it("keeps sign-in redirects on the application origin", async () => {
    await import("./middleware")

    expect(clerkMiddleware).toHaveBeenCalledWith(expect.any(Function), {
      signInUrl: "/sign-in",
    })
  })

  it.each([
    "/",
    "/api/workout",
    "/training",
    "/training?date=2026-07-14",
    "/wod",
  ])("allows public daily workout route %s without auth", async (url) => {
    const middleware = (await import("./middleware"))
      .default as unknown as MiddlewareHandler

    await middleware({ protect }, new Request(`http://localhost${url}`))

    expect(protect).not.toHaveBeenCalled()
  })

  it.each(["/programs", "/api/programs"])(
    "protects private program route %s",
    async (url) => {
      const middleware = (await import("./middleware"))
        .default as unknown as MiddlewareHandler

      await middleware({ protect }, new Request(`http://localhost${url}`))

      expect(protect).toHaveBeenCalledOnce()
    },
  )
})
