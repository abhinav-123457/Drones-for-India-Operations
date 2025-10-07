import Link from "next/link"

export default function HomePage() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center">
      <header className="max-w-2xl text-center px-6">
        <h1 className="text-3xl md:text-5xl font-semibold text-balance">MEDIVAC DRONE</h1>
        <p className="mt-4 text-muted-foreground text-pretty">
          Manage fleet, plan missions, and dispatch drones for medical logistics and search & rescue.
        </p>
        <div className="mt-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-md px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 transition"
            aria-label="Open Operations Dashboard"
          >
            Open Dashboard
          </Link>
        </div>
      </header>
    </main>
  )
}
