import DashboardClient from "@/components/dashboard-client"
import ThemeToggle from "@/components/theme-toggle"

export default function DashboardPage() {
  return (
    <main className="p-4 md:p-6 lg:p-8">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-balance">Operations Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Fleet status, live telemetry, mission planning, and emergency dispatch.
          </p>
        </div>
        <ThemeToggle />
      </header>
      <div className="mt-6">
        <DashboardClient />
      </div>
    </main>
  )
}
