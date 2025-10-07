"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const items = [
  "Battery > 80%",
  "Propellers secure",
  "RTL geofence set",
  "Comms link healthy",
  "NPNT / permission logged",
]

export default function ComplianceChecklist() {
  const [checked, setChecked] = useState<boolean[]>(Array(items.length).fill(false))

  const allDone = checked.every(Boolean)

  return (
    <Card className="p-4 bg-card text-card-foreground">
      <h2 className="text-lg font-medium">Preflight Checklist</h2>
      <ul className="mt-3 space-y-2">
        {items.map((label, i) => (
          <li key={i} className="flex items-center gap-2">
            <input
              id={`chk-${i}`}
              className="h-4 w-4 accent-primary"
              type="checkbox"
              checked={checked[i]}
              onChange={(e) => {
                const next = [...checked]
                next[i] = e.target.checked
                setChecked(next)
              }}
            />
            <label htmlFor={`chk-${i}`} className="text-sm">
              {label}
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-3">
        <Button disabled={!allDone} aria-disabled={!allDone}>
          {allDone ? "Checklist Complete" : "Complete all items"}
        </Button>
      </div>
    </Card>
  )
}
