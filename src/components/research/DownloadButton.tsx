'use client'

import { useState } from 'react'
import { FileText, Loader2 } from 'lucide-react'

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
      // Record the download event (fire-and-forget is fine, but we await for accuracy)
      await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listingId }),
      })
    } finally {
      setLoading(false)
      // Open the document in a new tab
      window.open(documentUrl, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileText className="h-4 w-4" />
      )}
      {isFree ? 'Download Free' : 'Purchase & Download'}
    </button>
  )
}
