"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type CesiumMapViewProps = {
  className?: string
  ionToken?: string
  center?: { lat: number; lon: number; height?: number }
  marker?: { lat: number; lon: number; label?: string }
}

declare global {
  interface Window {
    Cesium?: any
    __cesiumLoading?: boolean
  }
}

function loadCesium(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve()
  if (window.Cesium) return Promise.resolve()
  if (window.__cesiumLoading) {
    return new Promise((resolve) => {
      const check = () => (window.Cesium ? resolve() : requestAnimationFrame(check))
      check()
    })
  }
  window.__cesiumLoading = true
  return new Promise((resolve, reject) => {
    const cssId = "cesium-css"
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link")
      link.id = cssId
      link.rel = "stylesheet"
      link.href = "https://cdn.jsdelivr.net/npm/cesium@1.121.0/Build/Cesium/Widgets/widgets.css"
      document.head.appendChild(link)
    }
    const scriptId = "cesium-js"
    if (document.getElementById(scriptId)) {
      const check = () => (window.Cesium ? resolve() : setTimeout(check, 40))
      check()
      return
    }
    const script = document.createElement("script")
    script.id = scriptId
    script.src = "https://cdn.jsdelivr.net/npm/cesium@1.121.0/Build/Cesium/Cesium.js"
    script.async = true
    script.crossOrigin = "anonymous"
    script.onload = () => {
      const check = () => (window.Cesium ? resolve() : setTimeout(check, 30))
      check()
    }
    script.onerror = (e) => reject(e)
    document.body.appendChild(script)
  })
}

export default function CesiumMapView({ className, ionToken, center, marker }: CesiumMapViewProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const viewerRef = React.useRef<any>(null)
  const roRef = React.useRef<ResizeObserver | null>(null)

  React.useEffect(() => {
    let mounted = true

    async function init() {
      try {
        await loadCesium()
        if (!mounted || !containerRef.current) return
        const Cesium = window.Cesium

        if (ionToken) {
          Cesium.Ion.defaultAccessToken = ionToken
        }

        const imageryProvider = ionToken
          ? Cesium.createWorldImagery({ style: Cesium.IonWorldImageryStyle.AERIAL })
          : new Cesium.UrlTemplateImageryProvider({
              url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
              //credit: "© OpenStreetMap contributors",
              tilingScheme: new Cesium.WebMercatorTilingScheme(),
              maximumLevel: 19,
            })

        const viewer = new Cesium.Viewer(containerRef.current, {
          imageryProvider,
          terrainProvider: new Cesium.EllipsoidTerrainProvider(),
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          navigationHelpButton: false,
          sceneModePicker: false,
          animation: false,
          timeline: false,
          fullscreenButton: false,
          selectionIndicator: false,
          infoBox: false,
          requestRenderMode: true,
        })
        viewerRef.current = viewer

        // Ensure globe is visible and kick a render
        viewer.scene.globe.show = true
        viewer.scene.globe.enableLighting = false
        viewer.scene.requestRender()

        // Add a fallback marker so it's never blank
        const label = marker?.label ?? "Home: India"
        const lat = marker?.lat ?? 12.9716
        const lon = marker?.lon ?? 77.5946

        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(lon, lat, 80),
          point: {
            pixelSize: 10,
            color: Cesium.Color.RED,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
          },
          label: {
            text: label,
            font: "14px sans-serif",
            fillColor: Cesium.Color.WHITE,
            showBackground: true,
            backgroundColor: Cesium.Color.fromCssColorString("#111827").withAlpha(0.8),
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        })

        // Default camera: India, else fly to provided center
        const indiaRect = Cesium.Rectangle.fromDegrees(68.17665, 6.554607, 97.40256, 35.674545)
        if (center?.lat != null && center?.lon != null) {
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(center.lon, center.lat, center.height ?? 12000),
            duration: 0.8,
          })
        } else {
          viewer.camera.flyTo({ destination: indiaRect, duration: 0.8 })
        }

        // Render again after movement
        setTimeout(() => viewer.scene.requestRender(), 200)

        // Surface imagery errors in console for diagnostics
        const firstLayer = viewer.imageryLayers.get(0)
        firstLayer?.imageryProvider?.errorEvent?.addEventListener((e: any) => {
          console.log("[v0] Cesium imagery error:", e)
        })

        // Handle container resizes (e.g., panel reveal)
        if ("ResizeObserver" in window) {
          roRef.current = new ResizeObserver(() => {
            try {
              if (!viewer.isDestroyed()) {
                viewer.resize()
                viewer.scene.requestRender()
              }
            } catch {}
          })
          roRef.current.observe(containerRef.current)
        }
      } catch (err) {
        console.log("[v0] Cesium init error:", (err as Error)?.message)
      }
    }

    init()
    return () => {
      try {
        roRef.current?.disconnect()
        if (viewerRef.current && !viewerRef.current.isDestroyed()) {
          viewerRef.current.destroy()
        }
      } catch {}
      mounted = false
    }
  }, [ionToken, center?.lat, center?.lon, center?.height, marker?.lat, marker?.lon, marker?.label])

  return (
    <div className={cn("w-full h-96 md:h-[28rem] rounded-md overflow-hidden", className)}>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
