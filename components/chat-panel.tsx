"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

type Msg = { id: string; role: "operator" | "you"; text: string; ts: number }

export default function ChatPanel({ channel = "ops" }: { channel?: string }) {
  const [messages, setMessages] = useState<Msg[]>([
    { id: "m1", role: "operator", text: "Ops is online. How can we help?", ts: Date.now() },
  ])
  const [text, setText] = useState("")
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function send() {
    const t = text.trim()
    if (!t) return
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "you", text: t, ts: Date.now() }])
    setText("")
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      send()
    }
  }

  return (
    <Card className="p-4 h-full bg-card text-card-foreground">
      <h2 className="text-lg font-medium">Ops Chat</h2>
      <p className="text-sm text-muted-foreground">Channel: {channel}</p>
      <div className="mt-3 border rounded-md">
        <ScrollArea className="h-64 p-3">
          <div className="space-y-2">
            {messages.map((m) => (
              <div key={m.id} className={m.role === "you" ? "text-right" : "text-left"}>
                <span
                  className={
                    "inline-block rounded-md px-3 py-2 max-w-[85%] " +
                    (m.role === "you" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")
                  }
                >
                  {m.text}
                </span>
              </div>
            ))}
            <div ref={endRef} />
          </div>
        </ScrollArea>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Input
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          aria-label="Message"
        />
        <Button onClick={send}>Send</Button>
      </div>
    </Card>
  )
}
