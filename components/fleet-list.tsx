"use client"

import useSWR from "swr"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

type Drone = {
  id: string
  name: string
  status: "idle" | "in-flight" | "charging" | "maintenance"
  battery: number
  model: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function FleetList({
  selectedId,
  onSelect,
}: {
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const { data, isLoading } = useSWR<{ drones: Drone[] }>("/api/fleet", fetcher, {
    refreshInterval: 10000,
  })

  return (
    <Card className="p-4 bg-card text-card-foreground">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Fleet Overview</h2>
        <span className="text-xs text-muted-foreground">{data?.drones.length ?? 0} drones</span>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading && <p className="text-muted-foreground">Loading fleet…</p>}
        {data?.drones.map((d) => (
          <div
            key={d.id}
            className={`rounded-md border p-3 ${selectedId === d.id ? "ring-2 ring-primary" : ""}`}
            role="button"
            aria-pressed={selectedId === d.id}
            onClick={() => onSelect(d.id)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{d.name}</p>
                <p className="text-xs text-muted-foreground">
                  {d.model} • {d.status}
                </p>
              </div>
              <Button variant={selectedId === d.id ? "default" : "outline"} size="sm">
                {selectedId === d.id ? "Selected" : "Select"}
              </Button>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Battery</span>
                <span className="font-mono">{d.battery}%</span>
              </div>
              <Progress value={d.battery} className="mt-1" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
