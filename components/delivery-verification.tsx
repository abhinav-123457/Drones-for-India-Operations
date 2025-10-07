"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function DeliveryVerification() {
  const [sealed, setSealed] = useState(false)
  const [weight, setWeight] = useState<number | "">("")
  const [code, setCode] = useState("")
  const [delivered, setDelivered] = useState(false)

  const withinLimit = typeof weight === "number" && weight <= 5

  return (
    <Card className="p-4 bg-card text-card-foreground">
      <h2 className="text-lg font-medium">Payload Verification (≤ 5 kg)</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label>Seal Status</Label>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={sealed} onChange={(e) => setSealed(e.target.checked)} />
            <span>Payload sealed and tamper-free</span>
          </div>
        </div>

        <div>
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            min="0"
            value={weight}
            onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))}
          />
          {!withinLimit && weight !== "" && <p className="mt-1 text-xs text-red-500">Must be 5 kg or less.</p>}
        </div>

        <div>
          <Label htmlFor="code">QR/OTP Code</Label>
          <Input id="code" placeholder="Scan or enter code" value={code} onChange={(e) => setCode(e.target.value)} />
        </div>

        <div className="col-span-2 flex items-center gap-2">
          <Button disabled={!sealed || !withinLimit || code.trim().length < 4} onClick={() => setDelivered(true)}>
            Confirm Delivery
          </Button>
          {delivered && (
            <span className="text-xs text-muted-foreground">Delivery confirmed with proof-of-delivery.</span>
          )}
        </div>
      </div>
    </Card>
  )
}
