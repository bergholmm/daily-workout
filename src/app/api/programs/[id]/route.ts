import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

import * as db from "@/server/db/programs"

import { updateProgramSchema } from "@/lib/validators"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const program = await db.getProgram(Number(id))
  if (!program) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(program)
}

export async function PATCH(req: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = updateProgramSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 })
  }

  const program = await db.updateProgram(Number(id), parsed.data)
  if (!program) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(program)
}

export async function DELETE(_req: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const program = await db.deleteProgram(Number(id))
  if (!program) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(program)
}
