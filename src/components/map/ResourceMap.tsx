'use client'

import { useEffect, useRef } from 'react'
import { BOTSWANA_CENTER, BOTSWANA_ZOOM, ACCESS_TIER_MAP_COLORS } from '@/lib/constants'
import { blurCoordinates } from '@/lib/utils'
import type { AccessTier, KnowledgeCategory } from '@/lib/types'
import { KNOWLEDGE_CATEGORY_LABELS } from '@/lib/constants'

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

export function ResourceMap({ entries }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current || mapInstanceRef.current) return

    // Dynamically import Leaflet to avoid SSR issues
    import('leaflet').then(L => {
      // Fix Leaflet default icon paths in Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!).setView(BOTSWANA_CENTER, BOTSWANA_ZOOM)
      mapInstanceRef.current = map

      // OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map)

      // Plot entries
      entries.forEach(entry => {
        if (!entry.latitude || !entry.longitude) return

        let lat = entry.latitude
        let lng = entry.longitude

        // Blur coordinates for restricted; hide exact location for sacred
        if (entry.access_tier === 'restricted') {
          ;[lat, lng] = blurCoordinates(lat, lng, 0.05)
        } else if (entry.access_tier === 'sacred') {
          ;[lat, lng] = blurCoordinates(lat, lng, 0.3)
        }

        const color = ACCESS_TIER_MAP_COLORS[entry.access_tier]

        const icon = L.divIcon({
          className: '',
          html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        })

        const marker = L.marker([lat, lng], { icon }).addTo(map)

        const tierLabel = entry.access_tier === 'sacred'
          ? '🔴 Sacred (region only)'
          : entry.access_tier === 'restricted'
          ? '🟡 Restricted (approximate)'
          : '🟢 Public'

        marker.bindPopup(`
          <div style="min-width:180px">
            <strong style="font-size:13px">${entry.title}</strong><br/>
            <span style="font-size:11px;color:#666">${KNOWLEDGE_CATEGORY_LABELS[entry.category]}</span><br/>
            <span style="font-size:11px">${tierLabel}</span><br/>
            ${entry.verified ? '<span style="font-size:11px;color:#16a34a">✓ Community Verified</span>' : ''}
            <br/>
            <a href="/vault/${entry.id}" style="font-size:11px;color:#15803d">View entry →</a>
          </div>
        `)
      })
    })

    return () => {
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(mapInstanceRef.current as any).remove()
        mapInstanceRef.current = null
      }
    }
  }, [entries])

  return (
    <div
      ref={mapRef}
      className="w-full h-full min-h-[600px]"
      aria-label="Interactive map of indigenous knowledge resource locations in Botswana"
    />
  )
}
