'use client'

import { useEffect, useRef, useState } from 'react'
import { Map, Globe, Layers, ZoomIn, ZoomOut, LocateFixed, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BOTSWANA_CENTER, BOTSWANA_ZOOM, KNOWLEDGE_CATEGORY_LABELS } from '@/lib/constants'
import { blurCoordinates } from '@/lib/utils'
import type { AccessTier, KnowledgeCategory } from '@/lib/types'

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

/* ─── Warm tier colours ──────────────────────────────────────────────────────── */
const TIER_COLORS: Record<AccessTier, string> = {
  public:     '#15803D',  /* sage green */
  restricted: '#B45309',  /* warm amber */
  sacred:     '#B91C1C',  /* red earth  */
}

const TIER_LABELS: Record<AccessTier, string> = {
  public:     'Public Access',
  restricted: 'Restricted',
  sacred:     'Sacred / Protected',
}

/* ─── Legend ─────────────────────────────────────────────────────────────────── */
function MapLegend({ entryCount }: { entryCount: number }) {
  return (
    <div className="absolute bottom-4 left-4 z-10 rounded-2xl border border-[#E8DDD0] bg-white/95 backdrop-blur-sm px-4 py-3 shadow-sm pointer-events-none">
      <div className="flex items-center gap-1.5 mb-2.5">
        <Globe className="h-3.5 w-3.5 text-[#9CA3AF]" aria-hidden="true" />
        <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wide">Access Level</span>
      </div>
      <div className="space-y-1.5">
        {(Object.entries(TIER_COLORS) as [AccessTier, string][]).map(([tier, color]) => (
          <div key={tier} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} aria-hidden="true" />
            <span className="text-xs text-[#4B5563]">{TIER_LABELS[tier]}</span>
          </div>
        ))}
      </div>
      <div className="mt-2.5 pt-2 border-t border-[#F3F0EB] flex items-center gap-1.5">
        <Eye className="h-3.5 w-3.5 text-[#9CA3AF]" aria-hidden="true" />
        <span className="text-xs text-[#9CA3AF]">{entryCount} location{entryCount !== 1 ? 's' : ''}</span>
      </div>
    </div>
  )
}

/* ─── Custom controls ────────────────────────────────────────────────────────── */
function MapControls({ onZoomIn, onZoomOut, onReset }: { onZoomIn: () => void; onZoomOut: () => void; onReset: () => void }) {
  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
      {[
        { Icon: ZoomIn,      fn: onZoomIn,  label: 'Zoom in'    },
        { Icon: ZoomOut,     fn: onZoomOut, label: 'Zoom out'   },
        { Icon: LocateFixed, fn: onReset,   label: 'Reset view' },
      ].map(({ Icon, fn, label }) => (
        <button
          key={label}
          onClick={fn}
          aria-label={label}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8DDD0] bg-white text-[#4B5563] hover:text-[#9A3412] hover:border-[#9A3412] transition-colors shadow-sm"
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────────────────────────── */
export function ResearchMapPanel({ entries, selectedId, onSelectEntry, className }: Props) {
  const mapRef         = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef     = useRef<{ [key: string]: any }>({})
  const [mapReady, setMapReady] = useState(false)

  /* ── Init Leaflet ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || mapInstanceRef.current) return
    import('leaflet').then(L => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })
      const map = L.map(mapRef.current!, { zoomControl: false, attributionControl: true })
        .setView(BOTSWANA_CENTER, BOTSWANA_ZOOM)
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map)

      /* Style attribution for warm theme */
      const attr = map.attributionControl.getContainer()
      if (attr) {
        attr.style.background = 'rgba(255,255,255,0.9)'
        attr.style.color = '#9CA3AF'
        attr.style.fontSize = '9px'
        attr.style.borderRadius = '8px'
        attr.style.border = '1px solid #E8DDD0'
      }

      setMapReady(true)
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

  /* ── Re-plot on entry changes ──────────────────────────────────────────────── */
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return
    import('leaflet').then(L => {
      Object.values(markersRef.current).forEach(m => m.remove())
      markersRef.current = {}
      plotEntries(L, mapInstanceRef.current, entries)
    })
  }, [entries, mapReady]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Highlight selected ────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!mapReady) return
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const el    = marker.getElement()
      if (!el) return
      const inner = el.querySelector('div') as HTMLDivElement | null
      if (!inner) return
      if (id === selectedId) {
        inner.style.transform  = 'scale(1.8)'
        inner.style.zIndex     = '999'
        inner.style.boxShadow  = '0 0 0 4px rgba(154,52,18,0.3)'
        inner.classList.add('marker-selected')
        mapInstanceRef.current?.panTo(marker.getLatLng(), { animate: true, duration: 0.5 })
        marker.openPopup()
      } else {
        inner.style.transform  = 'scale(1)'
        inner.style.zIndex     = ''
        inner.style.boxShadow  = ''
        inner.classList.remove('marker-selected')
      }
    })
  }, [selectedId, mapReady])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function plotEntries(L: any, map: any, ents: MapEntry[]) {
    ents.forEach(entry => {
      if (!entry.latitude || !entry.longitude) return
      let lat = entry.latitude; let lng = entry.longitude
      if (entry.access_tier === 'restricted') [lat, lng] = blurCoordinates(lat, lng, 0.05)
      else if (entry.access_tier === 'sacred') [lat, lng] = blurCoordinates(lat, lng, 0.3)

      const color = TIER_COLORS[entry.access_tier]
      const icon  = L.divIcon({
        className: '',
        html: `<div style="
          width:13px;height:13px;border-radius:50%;
          background:${color};
          border:2.5px solid white;
          box-shadow:0 1px 6px rgba(0,0,0,0.2);
          transition:transform 0.2s ease;
          cursor:pointer;
        "></div>`,
        iconSize: [13, 13],
        iconAnchor: [6, 6],
      })

      const marker = L.marker([lat, lng], { icon }).addTo(map)

      /* Warm popup */
      marker.bindPopup(`
        <div style="min-width:190px;max-width:220px;padding:12px 14px;font-family:inherit;font-size:13px;color:#1F2937">
          <div style="font-weight:700;margin-bottom:3px;line-height:1.35">${entry.title}</div>
          <div style="font-size:11px;color:#9CA3AF;margin-bottom:6px">${KNOWLEDGE_CATEGORY_LABELS[entry.category]}</div>
          <div style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:600;background:${color}18;color:${color};border:1px solid ${color}40">${TIER_LABELS[entry.access_tier]}</div>
          ${entry.verified ? '<div style="font-size:10px;color:#15803D;margin-top:6px;font-weight:600">✓ Community Verified</div>' : ''}
          <a href="/vault/${entry.id}" style="display:block;margin-top:8px;font-size:11px;font-weight:600;color:#9A3412;text-decoration:none">View entry →</a>
        </div>
      `, { className: 'poloko-popup', maxWidth: 240 })

      if (onSelectEntry) marker.on('click', () => onSelectEntry(entry.id))
      markersRef.current[entry.id] = marker
    })
  }

  const geoEntries = entries.filter(e => e.latitude && e.longitude)

  return (
    <div
      className={cn('relative flex flex-col rounded-2xl border border-[#E8DDD0] overflow-hidden bg-[#F3F0EB]', className)}
      role="region"
      aria-label="Interactive map of indigenous knowledge locations in Botswana"
    >
      {geoEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
          <div className="h-14 w-14 rounded-2xl bg-white border border-[#E8DDD0] flex items-center justify-center shadow-sm">
            <Map className="h-7 w-7 text-[#D4C4B0]" aria-hidden="true" />
          </div>
          <div>
            <p className="text-base font-semibold text-[#4B5563]">No locations on map</p>
            <p className="text-sm text-[#9CA3AF] mt-1">Entries with GPS coordinates will appear here.</p>
          </div>
        </div>
      ) : (
        <>
          <div ref={mapRef} className="flex-1 w-full min-h-0" aria-hidden="true" />
          {mapReady && (
            <>
              <MapLegend entryCount={geoEntries.length} />
              <MapControls
                onZoomIn={() => mapInstanceRef.current?.zoomIn()}
                onZoomOut={() => mapInstanceRef.current?.zoomOut()}
                onReset={() => mapInstanceRef.current?.setView(BOTSWANA_CENTER, BOTSWANA_ZOOM, { animate: true })}
              />
              <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8DDD0] bg-white/90 backdrop-blur-sm pointer-events-none shadow-sm">
                <Layers className="h-3.5 w-3.5 text-[#9CA3AF]" aria-hidden="true" />
                <span className="text-xs text-[#4B5563] font-medium">OpenStreetMap</span>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
