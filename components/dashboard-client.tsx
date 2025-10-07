"use client"

import { useState } from "react"
import useSWR from "swr"
import FleetList from "./fleet-list"
import TelemetryPanel from "./telemetry-panel"
import MissionForm from "./mission-form"
import EmergencyDispatch from "./emergency-dispatch"
import ComplianceChecklist from "./compliance-checklist"
import MapView from "./map-view"
import ChatPanel from "./chat-panel"
import DeliveryVerification from "./delivery-verification"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function DashboardClient() {
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null)
  const [plannedPath, setPlannedPath] = useState<Array<{ lat: number; lng: number; alt?: number }> | null>(null)
  const [nfzPolygons, setNfzPolygons] = useState<Array<Array<{ lat: number; lng: number }>>>([])

  const CESIUM_ION_TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmZThkOTdlNi1mNjFlLTQ0MDMtODNlZi1iOWNlNzZhZjJkZGIiLCJpZCI6MzQ3OTgxLCJpYXQiOjE3NTk4MjUwNTR9.m4W2e2Jth1QoT_ZSYEeGe1AJAME0ZWtPMSd-sPJ2wIc"

  const telemetryUrl = selectedDroneId ? `/api/telemetry?droneId=${encodeURIComponent(selectedDroneId)}` : null
  const { data: telemetry } = useSWR<any>(telemetryUrl, fetcher, { refreshInterval: 2000 })

  const target =
    telemetry && typeof telemetry.lat === "number" && typeof telemetry.lng === "number"
      ? {
          lat: telemetry.lat,
          lng: telemetry.lng,
          alt: typeof telemetry.altitude === "number" ? telemetry.altitude : 120,
        }
      : undefined

  async function handlePlanRoute(params: {
    pickup: { lat: number; lng: number }
    drop: { lat: number; lng: number }
    useWeather: boolean
    avoidNfz: boolean
  }) {
    try {
      const res = await fetch("/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })
      const json = await res.json()
      if (json?.path) {
        setPlannedPath(json.path)
      }
      if (json?.nfz) {
        setNfzPolygons(json.nfz)
      }
    } catch (e) {
      console.log("[v0] route planning error:", (e as Error)?.message)
    }
  }

  // Left: Map (prominent) → Mission → Checklist
  // Right: Fleet → Telemetry → Dispatch → Delivery Verification → Chat
  // Ensures consistent spacing and prevents tiles from jumping when the map flies.
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-start md:grid-flow-row">
      {/* LEFT COLUMN */}
      <div className="md:col-span-12 lg:col-span-8 flex flex-col gap-4">
        <MapView
          droneId={selectedDroneId}
          target={target}
          ionToken={CESIUM_ION_TOKEN}
          path={plannedPath ?? undefined}
          nfz={nfzPolygons}
          className="h-[380px] md:h-[460px] lg:h-[520px]"
        />

        <div>
          <MissionForm defaultDroneId={selectedDroneId ?? undefined} onPlan={handlePlanRoute} />
        </div>

        <div>
          <ComplianceChecklist />
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-4">
        <div className="min-h-[240px]">
          <FleetList selectedId={selectedDroneId} onSelect={setSelectedDroneId} />
        </div>

        <div className="min-h-[240px]">
          <TelemetryPanel droneId={selectedDroneId} />
        </div>

        <div className="min-h-[220px]">
          <EmergencyDispatch />
        </div>

        <div className="min-h-[220px]">
          <DeliveryVerification />
        </div>

        <div className="min-h-[320px]">
          <ChatPanel channel="ops" />
        </div>
      </div>
    </section>
  )
}
