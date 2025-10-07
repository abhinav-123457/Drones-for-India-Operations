"use client"

import { useEffect, useRef, useState } from "react"

declare global {
  interface Window {
    Cesium?: any
    CESIUM_BASE_URL?: string
  }
}

const DEFAULT_ION_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmZThkOTdlNi1mNjFlLTQ0MDMtODNlZi1iOWNlNzZhZjJkZGIiLCJpZCI6MzQ3OTgxLCJpYXQiOjE3NTk4MjUwNTR9.m4W2e2Jth1QoT_ZSYEeGe1AJAME0ZWtPMSd-sPJ2wIc"

export default function MapView({
  droneId,
  className,
  ionToken,
  target,
  path,
  nfz,
}: {
  droneId?: string | null
  className?: string
  ionToken?: string
  target?: { lat: number; lng: number; alt?: number }
  path?: Array<{ lat: number; lng: number; alt?: number }>
  nfz?: Array<Array<{ lat: number; lng: number }>>
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const viewerRef = useRef<any>(null)
  const [loaded, setLoaded] = useState(false)
  const [terrainKind, setTerrainKind] = useState<"Ion World Terrain" | "Ellipsoid">("Ellipsoid")

  useEffect(() => {
    const ensureCesium = () => {
      if (window.Cesium) {
        setLoaded(true)
        return
      }
      if (!document.getElementById("cesium-css")) {
        const link = document.createElement("link")
        link.id = "cesium-css"
        link.rel = "stylesheet"
        link.href = "https://cdn.jsdelivr.net/npm/cesium@1.119.0/Build/Cesium/Widgets/widgets.css"
        link.crossOrigin = "anonymous"
        document.head.appendChild(link)
      }
      if (!document.getElementById("cesium-js")) {
        const script = document.createElement("script")
        script.id = "cesium-js"
        script.src = "https://cdn.jsdelivr.net/npm/cesium@1.119.0/Build/Cesium/Cesium.js"
        script.async = true
        script.crossOrigin = "anonymous"
        script.onload = () => {
          console.log("[v0] Cesium script onload fired")
        }
        document.head.appendChild(script)
      }
      const start = Date.now()
      const iv = setInterval(() => {
        if (window.Cesium) {
          clearInterval(iv)
          setLoaded(true)
        } else if (Date.now() - start > 10000) {
          clearInterval(iv)
          console.error("[v0] Cesium failed to load within 10s")
        }
      }, 100)
    }
    ensureCesium()
  }, [])

  useEffect(() => {
    if (!loaded || !containerRef.current || viewerRef.current || !window.Cesium) return

    window.CESIUM_BASE_URL = "https://cdn.jsdelivr.net/npm/cesium@1.119.0/Build/Cesium"
    const Cesium = window.Cesium

    try {
      const finalToken = ionToken ?? DEFAULT_ION_TOKEN
      if (finalToken) {
        try {
          Cesium.Ion.defaultAccessToken = finalToken
        } catch {}
      }

      let imageryProvider: any = null
      if (Cesium.IonImageryProvider?.fromAssetId) {
        // Latest satellite imagery from Cesium Ion
        imageryProvider = Cesium.IonImageryProvider.fromAssetId(2)
        console.log("[v0] Using IonImageryProvider asset 2")
      } else if (Cesium.createWorldImageryAsync) {
        imageryProvider = Cesium.createWorldImageryAsync({
          style: Cesium.IonWorldImageryStyle.AERIAL,
        })
        console.log("[v0] Using createWorldImageryAsync")
      }

      // Create viewer first, then attach imagery when ready
      const viewer = new Cesium.Viewer(containerRef.current, {
        baseLayerPicker: false,
        geocoder: false,
        navigationHelpButton: false,
        homeButton: false,
        sceneModePicker: false,
        animation: false,
        timeline: false,
        fullscreenButton: false,
        requestRenderMode: true,
        msaaSamples: 2,
      })

      const ssc = viewer.scene.screenSpaceCameraController
      ssc.inertiaSpin = 0
      ssc.inertiaTranslate = 0
      ssc.inertiaZoom = 0
      if (viewer.scene?.postProcessStages?.fxaa) {
        viewer.scene.postProcessStages.fxaa.enabled = true
      }

      viewer.scene.globe.show = true
      viewer.scene.globe.enableLighting = true
      viewer.scene.globe.showGroundAtmosphere = true
      viewer.scene.fog.enabled = true
      viewer.scene.requestRender()

      // Attach imagery (with OSM fallback) after viewer exists
      if (imageryProvider?.then) {
        imageryProvider
          .then((provider: any) => {
            viewer.imageryLayers.removeAll()
            viewer.imageryLayers.addImageryProvider(provider)
            viewer.scene.requestRender()
          })
          .catch((imErr: any) => {
            console.log("[v0] Ion/world imagery failed, falling back to OSM:", imErr)
            const osm = new Cesium.UrlTemplateImageryProvider({
              url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
              tilingScheme: new Cesium.WebMercatorTilingScheme(),
              maximumLevel: 19,
              credit: "© OpenStreetMap contributors",
            })
            viewer.imageryLayers.removeAll()
            viewer.imageryLayers.addImageryProvider(osm)
            viewer.scene.requestRender()
          })
      }

      let terrain: any
      if (Cesium.createWorldTerrainAsync) {
        terrain = Cesium.createWorldTerrainAsync({
          requestVertexNormals: true,
          requestWaterMask: true,
        })
        console.log("[v0] Using createWorldTerrainAsync")
      } else if (Cesium.CesiumTerrainProvider?.fromIonAssetId) {
        terrain = Cesium.CesiumTerrainProvider.fromIonAssetId(1, {
          requestVertexNormals: true,
          requestWaterMask: true,
        })
        console.log("[v0] Using CesiumTerrainProvider.fromIonAssetId(1)")
      } else {
        terrain = new Cesium.EllipsoidTerrainProvider()
        console.log("[v0] Using Ellipsoid terrain (fallback)")
      }
      Promise.resolve(terrain)
        .then((provider: any) => {
          setTerrainKind(provider instanceof Cesium.EllipsoidTerrainProvider ? "Ellipsoid" : "Ion World Terrain")
          if ("terrainProvider" in viewer) {
            ;(viewer as any).terrainProvider = provider
          } else if (viewer.scene?.globe) {
            viewer.scene.globe.terrainProvider = provider
          }
          viewer.scene.globe.depthTestAgainstTerrain = true
          viewer.scene.requestRender()
        })
        .catch((terrErr: any) => {
          console.log("[v0] Failed to set terrain, staying on Ellipsoid:", terrErr)
          setTerrainKind("Ellipsoid")
        })

      const indiaRect = Cesium.Rectangle.fromDegrees(68, 6, 97, 36)
      viewer.camera.setView({ destination: indiaRect })
      setTimeout(() => viewer.scene.requestRender(), 150)

      const layer = viewer.imageryLayers.get(0)
      layer?.imageryProvider?.errorEvent?.addEventListener((e: any) => {
        console.log("[v0] Cesium imagery error:", e)
      })

      viewerRef.current = viewer

      return () => {
        if (viewerRef.current && !viewerRef.current.isDestroyed()) {
          viewerRef.current.destroy()
          viewerRef.current = null
        }
      }
    } catch (e) {
      console.error("[v0] Failed to create Cesium viewer:", (e as Error)?.message)
    }
  }, [loaded, ionToken])

  useEffect(() => {
    const Cesium = window.Cesium
    const viewer = viewerRef.current
    if (!Cesium || !viewer) return

    // Remove prior target entity if exists
    const existing = viewer.entities.getById("map-target")
    if (existing) viewer.entities.remove(existing)

    let pos: { lat: number; lng: number; alt?: number } | null = null
    let label = ""
    if (target) {
      pos = target
      label = droneId ? `Drone ${droneId}` : "Target"
    } else if (droneId) {
      pos = { lat: 12.9716, lng: 77.5946, alt: 120 } // Bengaluru fallback
      label = `Drone ${droneId} (no GPS)`
    } else {
      pos = { lat: 28.6139, lng: 77.209, alt: 200 } // New Delhi "home"
      label = "Home: India"
    }

    viewer.entities.add({
      id: "map-target",
      name: label,
      position: Cesium.Cartesian3.fromDegrees(pos.lng, pos.lat, pos.alt ?? 120),
      point: { pixelSize: 10, color: droneId ? Cesium.Color.RED : Cesium.Color.BLUE },
      label: {
        text: label,
        font: "14px sans-serif",
        pixelOffset: new Cesium.Cartesian2(0, -18),
        fillColor: Cesium.Color.BLACK,
        showBackground: true,
        backgroundColor: Cesium.Color.fromCssColorString("#ffffff").withAlpha(0.8),
      },
    })

    viewer.scene.requestRender()
  }, [droneId, target])

  useEffect(() => {
    const Cesium = window.Cesium
    const viewer = viewerRef.current
    if (!Cesium || !viewer) return

    const priorRoute = viewer.entities.getById("planned-route")
    if (priorRoute) viewer.entities.remove(priorRoute)
    ;(viewer.entities.values || [])
      .filter((e: any) => e?.id?.startsWith?.("nfz-"))
      .forEach((e: any) => viewer.entities.remove(e))

    if (Array.isArray(nfz) && nfz.length > 0) {
      nfz.forEach((poly, idx) => {
        const hierarchy = Cesium.Cartesian3.fromDegreesArray(poly.flatMap((p) => [p.lng, p.lat]))
        viewer.entities.add({
          id: `nfz-${idx}`,
          polygon: {
            hierarchy,
            material: Cesium.Color.RED.withAlpha(0.25),
            outline: true,
            outlineColor: Cesium.Color.RED.withAlpha(0.6),
          },
        })
      })
    }

    if (Array.isArray(path) && path.length > 1) {
      const positions = Cesium.Cartesian3.fromDegreesArrayHeights(path.flatMap((p) => [p.lng, p.lat, p.alt ?? 120]))
      const routeEntity = viewer.entities.add({
        id: "planned-route",
        polyline: {
          positions,
          width: 4,
          material: new Cesium.PolylineOutlineMaterialProperty({
            color: Cesium.Color.CYAN,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 1,
          }),
          clampToGround: false,
        },
      })

      try {
        const lats = path.map((p) => p.lat)
        const lngs = path.map((p) => p.lng)
        const rect = Cesium.Rectangle.fromDegrees(
          Math.min(...lngs),
          Math.min(...lats),
          Math.max(...lngs),
          Math.max(...lats),
        )
        viewer.camera.flyTo({ destination: rect, duration: 0.8 })
      } catch {}
      viewer.scene.requestRender()
      return
    }
  }, [path, nfz])

  return (
    <div className="p-4 bg-card text-card-foreground">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Map View</h2>
        <span className="text-xs text-muted-foreground">
          Imagery: Cesium Ion World Imagery • Terrain: {terrainKind}
          {!droneId && !target ? " • Showing India by default" : ""}
        </span>
      </div>

      <div className="mt-3 overflow-hidden rounded-md border">
        <div
          ref={containerRef}
          className={`w-full h-80 md:h-[28rem] lg:h-[34rem] bg-muted ${className ?? ""}`}
          aria-label="Cesium 3D globe"
          role="region"
        />
      </div>
    </div>
  )
}
