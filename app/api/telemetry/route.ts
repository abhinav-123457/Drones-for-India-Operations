import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const droneId = searchParams.get("droneId") || "DR-001"

  // Generate deterministic-ish numbers based on droneId and time
  const t = Date.now() / 1000
  const base = hash(droneId) % 100
  const altitude = 30 + 10 * Math.sin(t / 6 + base)
  const speed = 8 + 4 * Math.cos(t / 7 + base)
  const battery = 30 + ((Math.abs(Math.sin(t / 60 + base)) * 70) | 0)
  const lat = 12.9716 + 0.005 * Math.sin(t / 300 + base)
  const lng = 77.5946 + 0.005 * Math.cos(t / 300 + base)
  const gpsFix = true
  const status = ["idle", "in-flight", "charging"][Math.floor((t / 30 + base) % 3)] as "idle" | "in-flight" | "charging"

  return NextResponse.json({
    droneId,
    altitude,
    speed,
    battery,
    lat,
    lng,
    gpsFix,
    status,
  })
}

function hash(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i)
  return Math.abs(h)
}
