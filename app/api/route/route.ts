import { NextResponse } from "next/server"

type Point = { lat: number; lng: number }

function lerpPath(a: Point, b: Point, steps = 40): Point[] {
  const out: Point[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    out.push({ lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t })
  }
  return out
}

function bbox(poly: Point[]) {
  const lats = poly.map((p) => p.lat)
  const lngs = poly.map((p) => p.lng)
  return { minLat: Math.min(...lats), maxLat: Math.max(...lats), minLng: Math.min(...lngs), maxLng: Math.max(...lngs) }
}

function lineIntersectsBbox(p: Point, q: Point, b: ReturnType<typeof bbox>) {
  const minLng = Math.min(p.lng, q.lng),
    maxLng = Math.max(p.lng, q.lng)
  const minLat = Math.min(p.lat, q.lat),
    maxLat = Math.max(p.lat, q.lat)
  return !(maxLng < b.minLng || minLng > b.maxLng || maxLat < b.minLat || minLat > b.maxLat)
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const pickup: Point | undefined = body?.pickup
  const drop: Point | undefined = body?.drop
  const avoidNfz: boolean = !!body?.avoidNfz
  // const useWeather: boolean = !!body?.useWeather // stub only

  if (!pickup || !drop) {
    return NextResponse.json({ error: "Missing pickup/drop" }, { status: 400 })
  }

  // sample NFZ polygon (rough area NW of New Delhi)
  const nfz: Point[] = [
    { lat: 28.73, lng: 76.99 },
    { lat: 28.9, lng: 77.05 },
    { lat: 28.88, lng: 77.25 },
    { lat: 28.7, lng: 77.22 },
  ]
  const nfzList: Point[][] = [nfz]

  let path = lerpPath(pickup, drop, 60)

  if (avoidNfz) {
    const b = bbox(nfz)
    if (lineIntersectsBbox(pickup, drop, b)) {
      // naive detour: insert a waypoint to skirt the bbox to the south
      const wp = { lat: b.minLat - 0.05, lng: (b.minLng + b.maxLng) / 2 }
      path = [...lerpPath(pickup, wp, 20), ...lerpPath(wp, drop, 40)]
    }
  }

  // add altitude profile (120m AGL nominal)
  const path3d = path.map((p) => ({ ...p, alt: 120 }))

  return NextResponse.json({ path: path3d, nfz: avoidNfz ? nfzList : [] })
}
