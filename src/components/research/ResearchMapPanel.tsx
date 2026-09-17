'use client'

/**
 * ResearchMapPanel
 * Right-hand split-screen map pane for the Research Hub.
 * Wraps the core ResourceMap (Leaflet) and adds:
 *  - Dark overlay legend
 *  - Selected-entry highlight pulse
 *  - Tile-layer toggle (terrain / satellite placeholder)
 *  - Empty / loading states
 */

import { useEffect, useRef, useState } from 'react'
import {
  Map, Globe, Layers, ZoomIn, ZoomOut,
  LocateFixed, Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { BOTSWANA_CENTER, BOTSWANA_ZOOM, KNOWLEDGE_CATEGORY_LABELS } from '@/lib/constants'
import { blurCoordinates } from '@/lib/utils'
import type { AccessTier, KnowledgeCategory } from '@/lib/types'

/* ─── Types ─────────────────────────────────────────────────────────────────── */
export interface MapEntry {
  id: string
  title: string
  category: KnowledgeCategory
  access_tier: AccessTier
  latitude: number | null
  longitude: number | null
  verified: boolean
}

interface Props {
  entries: MapEntry[]
  selectedId?: string | null
  onSelectEntry?: (id: string) => void
  className?: string
}

/* ─── Tier colours (dark-mode variants) ─────────────────────────────────────── */
const TIER_COLORS: Record<AccessTier, string> = {
  public:     '#10B981',  // emerald-500
  restricted: '#F59E0B',  // amber-500
  sacred:     '#EF4444',  // red-500
}

const TIER_LABELS: Record<AccessTier, string> = {
  public:     '🟢 Public',
  restricted: '🟡 Restricted (approximate)',
  sacred:     '🔴 Sacred (region only)',
}

/* ─── Map Legend ─────────────────────────────────────────────────────────────── */
function MapLegend({ entryCount }: { entryCount: number }) {
  return (
    <div className="absolute bottom-4 left-4 z-10 rounded-xl border border-slate-700/80 bg-slate-900/90 backdrop-blur-sm px-4 py-3 pointer-events-none">
      <div className="flex items-center gap-1.5 mb-2.5">
        <Globe className="h-3 w-3 text-slate-400" aria-hidden="true" />
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Access Tier</span>
      </div>
      <div className="space-y-1.5">
        {(Object.entries(TIER_COLORS) as [AccessTier, string][]).map(([tier, color]) => (
          <div key={tier} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: color }}
              aria-hidden="true"
            />
            <span className="text-[10px] text-slate-400 capitalize">{tier}</span>
          </div>
        ))}
      </div>
      <div className="mt-2.5 pt-2 border-t border-slate-700/60">
        <div className="flex items-center gap-1.5">
          <Eye className="h-3 w-3 text-slate-500" aria-hidden="true" />
          <span className="text-[10px] text-slate-500">{entryCount} location{entryCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  )
}

/* ─── Map controls ───────────────────────────────────────────────────────────── */
function MapControls({
  onZoomIn, onZoomOut, onReset,
}: {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}) {
  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
      {[
        { icon: ZoomIn,      fn: onZoomIn,  label: 'Zoom in'   },
        { icon: ZoomOut,     fn: onZoomOut, label: 'Zoom out'  },
        { icon: LocateFixed, fn: onReset,   label: 'Reset view' },
      ].map(({ icon: Icon, fn, label }) => (
        <button
          key={label}
          onClick={fn}
          aria-label={label}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/90 backdrop-blur-sm text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors shadow-lg"
        >
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────────────────────────── */
export function ResearchMapPanel({ entries, selectedId, onSelectEntry, className }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<{ [key: string]: any }>({})
  const [mapReady, setMapReady] = useState(false)

  /* ── Initialise Leaflet once ──────────────────────────────────────────────── */
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || mapInstanceRef.current) return

    import('leaflet').then(L => {
      // Fix default icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, {
        zoomControl: false,     // we render our own controls
        attributionControl: true,
      }).setView(BOTSWANA_CENTER, BOTSWANA_ZOOM)

      mapInstanceRef.current = map

      /* Dark OSM tile layer */
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright" style="color:#94A3B8">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map)

      /* Style attribution control */
      const attr = map.attributionControl.getContainer()
      if (attr) {
        attr.style.background = 'rgba(15,23,42,0.8)'
        attr.style.color = '#94A3B8'
        attr.style.fontSize = '9px'
        attr.style.borderRadius = '6px'
        attr.style.border = '1px solid rgba(51,65,85,0.6)'
      }

      setMapReady(true)

      /* Plot entries */
      plotEntries(L, map, entries)
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markersRef.current = {}
        setMapReady(false)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── Re-plot when entries list changes ───────────────────────────────────── */
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return
    import('leaflet').then(L => {
      /* Remove old markers */
      Object.values(markersRef.current).forEach(m => m.remove())
      markersRef.current = {}
      plotEntries(L, mapInstanceRef.current, entries)
    })
  }, [entries, mapReady])  // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Highlight selected marker ───────────────────────────────────────────── */
  useEffect(() => {
    if (!mapReady) return
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const el = marker.getElement()
      if (!el) return
      const inner = el.querySelector('div') as HTMLDivElement | null
      if (!inner) return
      if (id === selectedId) {
        inner.style.transform = 'scale(1.8)'
        inner.style.zIndex = '999'
        inner.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.5)'
        inner.classList.add('marker-selected')
        mapInstanceRef.current?.panTo(marker.getLatLng(), { animate: true, duration: 0.5 })
        marker.openPopup()
      } else {
        inner.style.transform = 'scale(1)'
        inner.style.zIndex = ''
        inner.style.boxShadow = ''
        inner.classList.remove('marker-selected')
      }
    })
  }, [selectedId, mapReady])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function plotEntries(L: any, map: any, ents: MapEntry[]) {
    ents.forEach(entry => {
      if (!entry.latitude || !entry.longitude) return

      let lat = entry.latitude
      let lng = entry.longitude

      if (entry.access_tier === 'restricted') {
        ;[lat, lng] = blurCoordinates(lat, lng, 0.05)
      } else if (entry.access_tier === 'sacred') {
        ;[lat, lng] = blurCoordinates(lat, lng, 0.3)
      }

      const color = TIER_COLORS[entry.access_tier]

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:11px;height:11px;border-radius:50%;
          background:${color};
          border:2px solid rgba(15,23,42,0.8);
          box-shadow:0 0 6px ${color}55;
          transition:transform 0.2s ease,box-shadow 0.2s ease;
          cursor:pointer;
        "></div>`,
        iconSize: [11, 11],
        iconAnchor: [5, 5],
      })

      const marker = L.marker([lat, lng], { icon }).addTo(map)

      /* Rich dark popup */
      marker.bindPopup(`
        <div style="
          min-width:190px;max-width:220px;
          background:#1E293B;color:#F8FAFC;
          border-radius:10px;padding:10px 12px;
          font-family:inherit;font-size:12px;
          border:1px solid #334155;
        ">
          <div style="font-weight:600;margin-bottom:4px;line-height:1.3">${entry.title}</div>
          <div style="font-size:10px;color:#94A3B8;margin-bottom:6px">${KNOWLEDGE_CATEGORY_LABELS[entry.category]}</div>
          <div style="font-size:10px">${TIER_LABELS[entry.access_tier]}</div>
          ${entry.verified
            ? '<div style="font-size:10px;color:#10B981;margin-top:4px">✓ Community Verified</div>'
            : ''
          }
          <a href="/vault/${entry.id}" style="
            display:inline-block;margin-top:8px;
            font-size:10px;font-weight:600;
            color:#10B981;text-decoration:none;
          ">View entry →</a>
        </div>
      `, {
        className: 'poloko-popup',
        maxWidth: 240,
      })

      /* Click: fire onSelectEntry if provided */
      if (onSelectEntry) {
        marker.on('click', () => onSelectEntry(entry.id))
      }

      markersRef.current[entry.id] = marker
    })
  }

  function handleZoomIn()  { mapInstanceRef.current?.zoomIn() }
  function handleZoomOut() { mapInstanceRef.current?.zoomOut() }
  function handleReset()   { mapInstanceRef.current?.setView(BOTSWANA_CENTER, BOTSWANA_ZOOM, { animate: true }) }

  const geoEntries = entries.filter(e => e.latitude && e.longitude)

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-xl border border-slate-700/60 overflow-hidden bg-slate-900',
        className
      )}
      role="region"
      aria-label="Interactive map of indigenous knowledge resource locations in Botswana"
    >
      {/* Map tile area */}
      {geoEntries.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-8">
          <div className="h-12 w-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
            <Map className="h-6 w-6 text-slate-600" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">No geo-tagged entries</p>
            <p className="text-xs text-slate-600 mt-1">Entries with GPS coordinates will appear here.</p>
          </div>
        </div>
      ) : (
        <>
          <div
            ref={mapRef}
            className="flex-1 w-full min-h-0"
            aria-hidden="true"  /* screen readers get legend text instead */
          />

          {/* Overlaid controls */}
          {mapReady && (
            <>
              <MapLegend entryCount={geoEntries.length} />
              <MapControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onReset={handleReset}
              />

              {/* Layer badge */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900/90 backdrop-blur-sm pointer-events-none">
                <Layers className="h-3 w-3 text-slate-400" aria-hidden="true" />
                <span className="text-[10px] text-slate-400 font-medium">OpenStreetMap</span>
              </div>
            </>
          )}
        </>
      )}

      {/* Leaflet popup global dark overrides */}
      <style>{`
        .poloko-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 10px !important;
          overflow: hidden !important;
        }
        .poloko-popup .leaflet-popup-content {
          margin: 0 !important;
        }
        .poloko-popup .leaflet-popup-tip-container {
          display: none !important;
        }
      `}</style>
    </div>
  )
}
