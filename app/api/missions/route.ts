import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = await req.json()
  const missionId = `MIS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  // In production, validate inputs, store to DB, and enqueue mission.
  return NextResponse.json({ ok: true, missionId, received: body })
}
