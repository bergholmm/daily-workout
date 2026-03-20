import { auth } from "@clerk/nextjs/server"
import { type NextRequest, NextResponse } from "next/server"

import { ScraperError, getWorkout } from "@/server/scrapers"

import { providerNameSchema } from "@/lib/validators"

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const searchParams = req.nextUrl.searchParams
  const date =
    searchParams.get("date") ?? new Date().toISOString().split("T")[0]!
  const providerNameRaw = searchParams.get("providerName") ?? "invictus"

  const parsed = providerNameSchema.safeParse(providerNameRaw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid provider name" },
      { status: 400 },
    )
  }

  try {
    const workout = await getWorkout(parsed.data, date)
    return NextResponse.json(workout)
  } catch (err) {
    if (err instanceof ScraperError && err.type === "not_found") {
      return new Response("Workout not found", { status: 404 })
    }
    console.error("Workout fetch error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
