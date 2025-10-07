import { NextResponse } from "next/server"

export async function GET() {
  const drones = [
    { id: "DR-001", name: "Rapid Med Alpha", status: "idle", battery: 92, model: "MR-1" },
    { id: "DR-002", name: "Rapid Med Bravo", status: "in-flight", battery: 58, model: "MR-1" },
    { id: "DR-003", name: "Rural VTOL One", status: "charging", battery: 36, model: "MR-2" },
    { id: "DR-004", name: "Indoor Scout", status: "maintenance", battery: 77, model: "SR-1" },
  ]
  return NextResponse.json({ drones })
}
