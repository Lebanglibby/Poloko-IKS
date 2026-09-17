'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { BOTSWANA_CENTER, BOTSWANA_ZOOM, ACCESS_TIER_MAP_COLORS, KNOWLEDGE_CATEGORY_LABELS } from '@/lib/constants'
import { blurCoordinates } from '@/lib/utils'
import type { AccessTier, KnowledgeCategory } from '@/lib/types'

interface MapEntry {
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
}

/* ─── Escape HTML for safe Leaflet popup interpolation ──────────────────────── */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/* ─── Build accessible popup HTML ───────────────────────────────────────────── */
function buildPopupHtml(entry: MapEntry, tierLabel: string): string {
  const safeTitle    = escapeHtml(entry.title)
  const safeCat      = escapeHtml(KNOWLEDGE_CATEGORY_LABELS[entry.category] ?? entry.category)
  const safeTier     = escapeHtml(tierLabel)
  const verifiedLine = entry.verified
    ? '<span style="font-size:11px;color:#15803D;font-weight:600">✓ Community Verified</span><br/>'
    : ''

  return `
    <div style="min-width:190px;max-width:240px;font-family:system-ui,sans-serif">
      <strong style="font-size:13px;color:#1F2937;display:block;margin-bottom:3px;line-height:1.3">
        ${safeTitle}
      </strong>
      <span style="font-size:11px;color:#6B5344;display:block;margin-bottom:2px">${safeCat}</span>
      <span style="font-size:11px;display:block;margin-bottom:4px">${safeTier}</span>
      ${verifiedLine}
      <a
        href="/vault/${escapeHtml(entry.id)}"
        style="font-size:11px;color:#9A3412;font-weight:600;text-decoration:none"
        aria-label="View full entry for ${safeTitle}"
      >View entry →</a>
    </div>
  `.trim()
}

/* ─── Component ─────────────────────────────────────────────────────────────── */
export function ResourceMap({ entries }: Props) {
  const mapRef         = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)
  // Store marker references keyed by entry id for highlight navigation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef     = useRef<Map<string, any>>(new Map())
  const searchParams   = useSearchParams()
  const highlightId    = searchParams?.get('highlight') ?? null

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || mapInstanceRef.current) return

    import('leaflet').then(L => {
      /* Fix Leaflet default icon paths in Next.js (unused but required for L.Icon.Default) */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, {
        // Improve keyboard accessibility — enable keyboard nav
        keyboard: true,
        // Prevent scroll zoom on page scroll-through
        scrollWheelZoom: false,
      }).setView(BOTSWANA_CENTER, BOTSWANA_ZOOM)

      mapInstanceRef.current = map

      /* OpenStreetMap tiles with warm parchment tint */
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map)

      /* Plot entries */
      entries.forEach(entry => {
        if (!entry.latitude || !entry.longitude) return

        let lat = entry.latitude
        let lng = entry.longitude

        /* Blur coordinates per access tier */
        if (entry.access_tier === 'restricted') {
          ;[lat, lng] = blurCoordinates(lat, lng, 0.05)
        } else if (entry.access_tier === 'sacred') {
          ;[lat, lng] = blurCoordinates(lat, lng, 0.3)
        }

        const color = ACCESS_TIER_MAP_COLORS[entry.access_tier]

        /* Tier label — plain text, no HTML in marker data */
        const tierLabel =
          entry.access_tier === 'sacred'     ? 'Sacred — region only' :
          entry.access_tier === 'restricted' ? 'Restricted — approximate area' :
                                               'Public — exact location'

        /* Custom dot marker — sized slightly larger for easier tap/click targets */
        const icon = L.divIcon({
          className: '',
          html: `<div
            role="img"
            aria-label="${escapeHtml(entry.title)} — ${escapeHtml(tierLabel)}"
            style="
              width:14px;height:14px;border-radius:50%;
              background:${color};
              border:2.5px solid white;
              box-shadow:0 1px 5px rgba(0,0,0,0.35);
              cursor:pointer;
            "
          ></div>`,
          iconSize:   [14, 14],
          iconAnchor: [7, 7],
        })

        const marker = L.marker([lat, lng], { icon, alt: entry.title }).addTo(map)

        /* Safe popup — all strings escaped before interpolation */
        marker.bindPopup(buildPopupHtml(entry, tierLabel), {
          maxWidth: 260,
          className: 'poloko-popup',
        })

        markersRef.current.set(entry.id, marker)
      })

      /* ── Handle ?highlight=<id> — pan + open popup ─────────────── */
      if (highlightId) {
        const targetMarker = markersRef.current.get(highlightId)
        if (targetMarker) {
          // Slight delay to let tiles load first
          setTimeout(() => {
            map.setView(targetMarker.getLatLng(), 10, { animate: true })
            targetMarker.openPopup()
            // Add a brief pulse class for visual emphasis
            const el = targetMarker.getElement()
            if (el) {
              el.firstElementChild?.classList.add('marker-selected')
              setTimeout(() => el.firstElementChild?.classList.remove('marker-selected'), 500)
            }
          }, 400)
        }
      }
    })

    return () => {
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(mapInstanceRef.current as any).remove()
        mapInstanceRef.current = null
        markersRef.current.clear()
      }
    }
  }, [entries, highlightId])

  return (
    <div
      ref={mapRef}
      className="w-full h-full min-h-[600px]"
      role="application"
      aria-label="Interactive map of indigenous knowledge resource locations across Botswana. Use arrow keys to pan, plus and minus to zoom. Click a marker to view entry details."
      /* Ensure the map div is focusable for keyboard users */
      tabIndex={0}
    />
  )
}
