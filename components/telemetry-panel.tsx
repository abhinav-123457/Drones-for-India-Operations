"use client"

import useSWR from "swr"
import { Card } from "@/components/ui/card"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function TelemetryPanel({ droneId }: { droneId: string | null }) {
  const url = droneId ? `/api/telemetry?droneId=${encodeURIComponent(droneId)}` : null
  const { data } = useSWR<any>(url, fetcher, {
    refreshInterval: 2000,
  })

  return (
    <Card className="p-4 bg-card text-card-foreground">
      <h2 className="text-lg font-medium">Live Telemetry</h2>
      {!droneId && <p className="text-muted-foreground mt-2">Select a drone to view telemetry.</p>}
      {droneId && (
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <Field label="Drone ID" value={droneId} />
          <Field label="Status" value={data?.status ?? "—"} />
          <Field label="Altitude (m)" value={fmt(data?.altitude)} />
          <Field label="Speed (m/s)" value={fmt(data?.speed)} />
          <Field label="Battery (%)" value={fmt(data?.battery)} />
          <Field label="GPS Fix" value={data?.gpsFix ? "Yes" : "No"} />
          <Field label="Lat" value={fmt(data?.lat)} />
          <Field label="Lng" value={fmt(data?.lng)} />
        </div>
      )}
    </Card>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-2 bg-background">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-mono">{value}</p>
    </div>
  )
}

function fmt(v: any) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—"
  if (typeof v === "number") return v.toFixed(2)
  return String(v)
}
