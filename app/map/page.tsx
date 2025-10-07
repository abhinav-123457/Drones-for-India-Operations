export default function CesiumMapPage() {
  return (
    <main className="p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-semibold mb-4 text-pretty">Operations Map</h1>
      <p className="mb-4 text-sm md:text-base text-pretty">
        This page renders a Cesium globe using OpenStreetMap imagery. If you see the globe here but not on the
        dashboard, the issue is layout-related; otherwise it was loading.
      </p>
      {/* Using a dynamic import is not necessary because we load Cesium via CDN inside MapView */}
      {/* @ts-expect-error Server Component imports a Client Component */}
      <MapView className="h-96 md:h-[32rem]" />
    </main>
  )
}

// Note: v0 merges imports, so we place this after to avoid rewriting the whole file.
import MapView from "@/components/map-view"
