"use client"

import { useState, useTransition } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function MissionForm({
  defaultDroneId,
  onPlan,
}: {
  defaultDroneId?: string
  onPlan?: (args: {
    pickup: { lat: number; lng: number }
    drop: { lat: number; lng: number }
    useWeather: boolean
    avoidNfz: boolean
  }) => void
}) {
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<string | null>(null)
  const [useWeather, setUseWeather] = useState(true)
  const [avoidNfz, setAvoidNfz] = useState(true)

  function onSubmit(formData: FormData) {
    setResult(null)
    const payload = {
      droneId: formData.get("droneId") as string,
      pickup: {
        lat: Number.parseFloat(formData.get("pickupLat") as string),
        lng: Number.parseFloat(formData.get("pickupLng") as string),
      },
      drop: {
        lat: Number.parseFloat(formData.get("dropLat") as string),
        lng: Number.parseFloat(formData.get("dropLng") as string),
      },
      payloadKg: Number.parseFloat(formData.get("payloadKg") as string),
    }

    startTransition(async () => {
      const res = await fetch("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      setResult(`Mission created: ${json.missionId}`)
    })
  }

  function planRoute(formData: FormData) {
    const pickup = {
      lat: Number.parseFloat(formData.get("pickupLat") as string),
      lng: Number.parseFloat(formData.get("pickupLng") as string),
    }
    const drop = {
      lat: Number.parseFloat(formData.get("dropLat") as string),
      lng: Number.parseFloat(formData.get("dropLng") as string),
    }
    onPlan?.({ pickup, drop, useWeather, avoidNfz })
  }

  return (
    <Card className="p-4 bg-card text-card-foreground h-full">
      <h2 className="text-lg font-medium">Mission Planner</h2>
      <form className="mt-3 grid grid-cols-2 gap-3" action={(fd) => onSubmit(fd)}>
        <div className="col-span-2">
          <Label htmlFor="droneId">Drone ID</Label>
          <Input id="droneId" name="droneId" placeholder="e.g. DR-001" defaultValue={defaultDroneId} required />
        </div>

        <div>
          <Label htmlFor="pickupLat">Pickup Lat</Label>
          <Input id="pickupLat" name="pickupLat" type="number" step="0.000001" required />
        </div>
        <div>
          <Label htmlFor="pickupLng">Pickup Lng</Label>
          <Input id="pickupLng" name="pickupLng" type="number" step="0.000001" required />
        </div>

        <div>
          <Label htmlFor="dropLat">Drop Lat</Label>
          <Input id="dropLat" name="dropLat" type="number" step="0.000001" required />
        </div>
        <div>
          <Label htmlFor="dropLng">Drop Lng</Label>
          <Input id="dropLng" name="dropLng" type="number" step="0.000001" required />
        </div>

        <div className="col-span-2">
          <Label htmlFor="payloadKg">Payload (kg)</Label>
          <Input id="payloadKg" name="payloadKg" type="number" step="0.1" min="0" required />
        </div>

        {/* Route options */}
        <div className="col-span-2 flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={useWeather} onChange={(e) => setUseWeather(e.target.checked)} />
            Use weather
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={avoidNfz} onChange={(e) => setAvoidNfz(e.target.checked)} />
            Avoid no-fly zones
          </label>
        </div>

        <div className="col-span-2 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget.form ?? undefined)
              planRoute(fd)
            }}
          >
            Plan Route
          </Button>

          <Button type="submit" disabled={pending}>
            {pending ? "Creating…" : "Create Mission"}
          </Button>

          {result && <span className="text-sm text-muted-foreground">{result}</span>}
        </div>
      </form>
    </Card>
  )
}
