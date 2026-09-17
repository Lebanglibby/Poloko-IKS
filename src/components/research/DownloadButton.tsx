'use client'

import { useState } from 'react'
import { Download, Loader2, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/components/shared/ToastProvider'

interface Props {
  listingId: string
  documentUrl: string
  isFree: boolean
}

export function DownloadButton({ listingId, documentUrl, isFree }: Props) {
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const { toast } = useToast()

  async function handleDownload() {
    setLoading(true)
    try {
      await fetch('/api/download', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ listing_id: listingId }),
      })
      window.open(documentUrl, '_blank', 'noopener,noreferrer')
      setDone(true)
      toast({
        type:        'success',
        message:     'Download started',
        description: 'The document has opened in a new tab.',
      })
      setTimeout(() => setDone(false), 3000)
    } catch {
      toast({
        type:    'error',
        message: 'Download failed',
        description: 'Please try again or contact support.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      aria-busy={loading}
      aria-label={isFree ? 'Download this research document for free' : 'Purchase and download this research document'}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-60 shadow-sm"
      style={{
        background: done ? '#F0F7F4' : 'var(--r-primary)',
        color:      done ? '#2D6A4F' : 'white',
        border:     done ? '2px solid #95D5B2' : '2px solid transparent',
      }}
    >
      {loading ? (
        <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Preparing…</>
      ) : done ? (
        <><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Download started!</>
      ) : (
        <><Download className="h-4 w-4" aria-hidden="true" /> {isFree ? 'Download Free' : 'Purchase & Download'}</>
      )}
    </button>
  )
}
