'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

interface Props {
  listingId: string
  documentUrl: string
  isFree: boolean
}

export function DownloadButton({ listingId, documentUrl, isFree }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listingId }),
      })
    } finally {
      setLoading(false)
      window.open(documentUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-[#9A3412] hover:bg-[#7C2D12] text-white py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-60 shadow-sm"
      aria-busy={loading}
    >
      {loading
        ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Preparing…</>
        : <><Download className="h-4 w-4" aria-hidden="true" /> {isFree ? 'Download Free' : 'Purchase & Download'}</>
      }
    </button>
  )
}
