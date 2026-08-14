import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

import { getPublicProgramBySlug } from "@/server/db/programs"
import { startNewProgramRun } from "@/server/db/session-records"

import { BUILT_TO_MOVE_PROGRAM_SLUG } from "@/lib/built-to-move-program"

export async function POST() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const program = await getPublicProgramBySlug(BUILT_TO_MOVE_PROGRAM_SLUG)
  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 })
  }

  const run = await startNewProgramRun(userId, program.id)
  return NextResponse.json(run, { status: 201 })
}
