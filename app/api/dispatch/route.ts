import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const body = await req.json()
  const jobId = `JOB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  // In production, integrate with 112 CAD and notify operators.
  return NextResponse.json({ ok: true, jobId, received: body })
}
