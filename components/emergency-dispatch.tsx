"use client"

import { useState, useTransition } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function EmergencyDispatch() {
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<string | null>(null)

  function onSubmit(formData: FormData) {
    setResult(null)
    const payload = {
      address: formData.get("address"),
      type: formData.get("type"),
      notes: formData.get("notes"),
    }

    startTransition(async () => {
      const res = await fetch("/api/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      setResult(`Dispatch created: ${json.jobId}`)
    })
  }

  return (
    <Card className="p-4 bg-card text-card-foreground h-full">
      <h2 className="text-lg font-medium">Emergency Dispatch</h2>
      <form className="mt-3 space-y-3" action={onSubmit}>
        <div>
          <Label htmlFor="address">Location / Address</Label>
          <Input id="address" name="address" placeholder="e.g. PHC Kadapa, Andhra Pradesh" required />
        </div>
        <div>
          <Label htmlFor="type">Package Type</Label>
          <Input id="type" name="type" placeholder="AED, blood, vaccines" required />
        </div>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Input id="notes" name="notes" placeholder="Land on helipad / use winch" />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Dispatching…" : "Dispatch Now"}
        </Button>
        {result && <p className="text-sm text-muted-foreground">{result}</p>}
      </form>
    </Card>
  )
}
