import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

import * as db from "@/server/db/programs"

import { createProgramSchema } from "@/lib/validators"

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const programs = await db.listPrograms()
  return NextResponse.json(programs)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createProgramSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 })
  }

  const program = await db.createProgram({
    ...parsed.data,
    createdBy: userId,
  })

  return NextResponse.json(program, { status: 201 })
}
