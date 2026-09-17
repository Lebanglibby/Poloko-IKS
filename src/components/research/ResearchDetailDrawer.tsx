'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  X, Shield, Download, FileText, Copy, Check, ExternalLink,
  Eye, Users, Tag, UserPlus, ChevronDown, ChevronUp,
  BookMarked, Zap, Image as ImageIcon, Film,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate, formatRelativeDate } from '@/lib/utils'
import { LICENSE_TYPE_LABELS } from '@/lib/constants'
import { LicenseSelector } from '@/components/research/LicenseSelector'
import { useToast } from '@/components/shared/ToastProvider'
import type { ResearchListing, LicenseType } from '@/lib/types'

/* ─── Skeleton ──────────────────────────────────────────────────────────────── */
function DrawerSkeleton() {
  return (
    <div className="p-6 space-y-4" aria-hidden="true">
      <div className="skeleton h-7 w-4/5 rounded-xl" />
      <div className="skeleton h-4 w-1/3 rounded" />
      <div className="skeleton h-16 w-full rounded-2xl" />
      <div className="skeleton h-28 w-full rounded-2xl" />
      <div className="skeleton h-20 w-full rounded-2xl" />
      <div className="skeleton h-10 w-full rounded-2xl" />
    </div>
  )
}

/* ─── Protected record block ────────────────────────────────────────────────── */
function ProtectedRecordBlock({ hash }: { hash: string }) {
  const [copied, setCopied] = useState(false)
  const { toast }  = useToast()
  const btnRef     = useRef<HTMLButtonElement>(null)

  async function copyHash() {
    await navigator.clipboard.writeText(hash)
    setCopied(true)
    btnRef.current?.classList.add('hash-copied')
    toast({ type: 'success', message: 'Proof of authorship copied', description: 'The unique identifier has been copied to your clipboard.' })
    setTimeout(() => { setCopied(false); btnRef.current?.classList.remove('hash-copied') }, 2500)
  }

  return (
    <div className="rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="h-9 w-9 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
          <Shield className="h-4.5 w-4.5 text-[#15803D]" style={{ width: 18, height: 18 }} aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#14532D]">Verified Authorship Record</p>
          <p className="text-xs text-[#15803D] mt-0.5 leading-relaxed">
            This research has a tamper-proof unique identifier proving when it was registered in the Poloko IKS system.
          </p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-[#BBF7D0] p-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Unique Proof ID</span>
          <button
            ref={btnRef}
            onClick={copyHash}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all',
              copied
                ? 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]'
                : 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0] hover:bg-[#DCFCE7]'
            )}
            aria-label={copied ? 'Copied!' : 'Copy proof identifier'}
          >
            {copied ? <><Check className="h-3 w-3" aria-hidden="true" /> Copied!</> : <><Copy className="h-3 w-3" aria-hidden="true" /> Copy</>}
          </button>
        </div>
        <p className="font-mono text-[10px] text-[#4B5563] break-all leading-relaxed select-all">{hash}</p>
      </div>
    </div>
  )
}

/* ─── Media viewer ──────────────────────────────────────────────────────────── */
function MediaViewer({ urls }: { urls: string[] }) {
  const [active, setActive] = useState(0)
  if (!urls.length) return null
  const url = urls[active]
  const ext = url.split('.').pop()?.toLowerCase() ?? ''
  const isVideo = ['mp4', 'webm', 'mov'].includes(ext)
  const isAudio = ['mp3', 'wav', 'ogg', 'm4a'].includes(ext)

  return (
    <div className="rounded-2xl border border-[#E8DDD0] overflow-hidden bg-[#FDFBF7]">
      <div className="relative aspect-video bg-[#F3F0EB] flex items-center justify-center">
        {isVideo ? (
          <video src={url} controls className="w-full h-full object-contain" aria-label="Research video" />
        ) : isAudio ? (
          <div className="flex flex-col items-center gap-3 p-6">
            <Film className="h-10 w-10 text-[#D4C4B0]" aria-hidden="true" />
            <audio src={url} controls className="w-full" aria-label="Research audio" />
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={`Media ${active + 1}`} className="w-full h-full object-contain" />
        )}
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/80 text-[#4B5563] hover:text-[#9A3412] border border-[#E8DDD0] transition-colors"
          aria-label="Open in new tab">
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
      {urls.length > 1 && (
        <div className="flex gap-2 p-3 border-t border-[#E8DDD0] overflow-x-auto" role="tablist">
          {urls.map((u, i) => (
            <button key={i} role="tab" aria-selected={active === i} onClick={() => setActive(i)}
              className={cn('shrink-0 h-12 w-16 rounded-xl border-2 overflow-hidden transition-all',
                active === i ? 'border-[#9A3412]' : 'border-[#E8DDD0] hover:border-[#D4C4B0]'
              )} aria-label={`Media ${i + 1}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" className="h-full w-full object-cover" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Collapsible section ───────────────────────────────────────────────────── */
function Section({ title, icon: Icon, defaultOpen = true, children }: {
  title: string; icon: typeof Shield; defaultOpen?: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const id = `res-sec-${title.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <div className="rounded-2xl border border-[#E8DDD0] bg-white overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#FDFBF7] transition-colors text-left"
        aria-expanded={open} aria-controls={id}>
        <span className="flex items-center gap-2.5 text-sm font-semibold text-[#1F2937]">
          <Icon className="h-4 w-4 text-[#9CA3AF]" aria-hidden="true" />
          {title}
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-[#9CA3AF]" aria-hidden="true" /> : <ChevronDown className="h-4 w-4 text-[#9CA3AF]" aria-hidden="true" />}
      </button>
      {open && <div id={id} className="px-5 pb-5 space-y-3">{children}</div>}
    </div>
  )
}

/* ─── Main drawer ───────────────────────────────────────────────────────────── */
interface DrawerProps {
  listing: ResearchListing | null
  isOpen: boolean
  onClose: () => void
  userRole?: string | null
  userId?: string | null
}

export function ResearchDetailDrawer({ listing, isOpen, onClose, userRole, userId }: DrawerProps) {
  const [loading,         setLoading]         = useState(false)
  const [downloading,     setDownloading]     = useState(false)
  const [citing,          setCiting]          = useState(false)
  const [selectedLicense, setSelectedLicense] = useState<LicenseType | null>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const closeRef  = useRef<HTMLButtonElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!isOpen) return
    const prev = document.activeElement as HTMLElement
    setTimeout(() => closeRef.current?.focus(), 60)
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab' || !drawerRef.current) return
      const els = drawerRef.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])')
      const first = els[0]; const last = els[els.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); prev?.focus() }
  }, [isOpen, onClose])

  useEffect(() => {
    if (listing) {
      setSelectedLicense(listing.license_type ?? null)
      setLoading(true)
      const t = setTimeout(() => setLoading(false), 200)
      return () => clearTimeout(t)
    }
  }, [listing?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDownload = useCallback(async () => {
    if (!listing?.full_document_url) return
    setDownloading(true)
    try {
      await fetch('/api/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listing_id: listing.id }) })
      window.open(listing.full_document_url, '_blank', 'noopener,noreferrer')
      toast({ type: 'success', message: listing.price === 0 ? 'Download started' : 'Purchase successful', description: listing.title })
    } catch {
      toast({ type: 'error', message: 'Download failed. Please try again.' })
    } finally { setDownloading(false) }
  }, [listing, toast])

  const handleCite = useCallback(async () => {
    if (!listing) return
    setCiting(true)
    const citation = [
      listing.profiles?.full_name ?? 'Unknown Author',
      `(${new Date(listing.created_at).getFullYear()}).`,
      listing.title + '.',
      'Poloko IKS Research Hub.',
      `Record ID: ${listing.sha256_hash.slice(0, 16)}…`,
    ].join(' ')
    try {
      await navigator.clipboard.writeText(citation)
      await fetch('/api/audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'cite', target_type: 'research_listing', target_id: listing.id }) })
      toast({ type: 'success', message: 'Citation copied', description: 'Formatted citation is ready to paste.' })
    } catch {
      toast({ type: 'error', message: 'Could not copy citation.' })
    } finally { setTimeout(() => setCiting(false), 1500) }
  }, [listing, toast])

  if (!isOpen) return null

  const listingWithMedia = listing as (ResearchListing & { media_urls?: string[] }) | null

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-[#1F2937]/40 backdrop-blur-[2px]" aria-hidden="true" onClick={onClose} />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={listing ? `Research: ${listing.title}` : 'Research details'}
        className={cn(
          'fixed right-0 top-0 bottom-0 z-[70] flex flex-col',
          'w-full sm:w-[500px] lg:w-[540px]',
          'bg-[#FDFBF7] border-l border-[#E8DDD0] shadow-2xl shadow-[#1F2937]/10',
          isOpen ? 'drawer-enter' : 'drawer-exit'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8DDD0] bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#FEF2E8] border border-[#FDBA74] flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4 text-[#9A3412]" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1F2937]">Research Details</p>
              <p className="text-xs text-[#9CA3AF]">Poloko IKS Research Hub</p>
            </div>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            className="p-2 rounded-xl text-[#9CA3AF] hover:text-[#9A3412] hover:bg-[#FEF9F0] transition-colors border border-transparent hover:border-[#E8DDD0]"
            aria-label="Close research details"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {loading || !listing ? (
            <DrawerSkeleton />
          ) : (
            <div className="p-6 space-y-5">
              {/* Title */}
              <div>
                <h2 className="text-xl font-bold text-[#1F2937] leading-snug mb-2">{listing.title}</h2>
                <div className="flex flex-wrap items-center gap-2 text-sm text-[#4B5563]">
                  {listing.profiles?.full_name && (
                    <span className="font-medium text-[#1F2937]">{listing.profiles.full_name}</span>
                  )}
                  {listing.profiles?.community && <><span className="text-[#D4C4B0]">·</span><span>{listing.profiles.community}</span></>}
                  <span className="text-[#D4C4B0]">·</span>
                  <span className="text-[#9CA3AF] text-xs">{formatRelativeDate(listing.created_at)}</span>
                </div>
                {listing.tags && listing.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3" aria-label="Tags">
                    {listing.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 bg-[#F3F0EB] text-[#4B5563] text-xs px-2.5 py-1 rounded-full">
                        <Tag className="h-3 w-3 text-[#9CA3AF]" aria-hidden="true" />{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Views',         value: listing.view_count,               icon: Eye      },
                  { label: 'Downloads',     value: listing.download_count,           icon: Download },
                  { label: 'Contributors',  value: listing.collaborators?.length ?? 0, icon: Users  },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-white border border-[#E8DDD0] text-center">
                    <Icon className="h-4 w-4 text-[#9CA3AF]" aria-hidden="true" />
                    <span className="text-lg font-bold text-[#1F2937]">{value.toLocaleString()}</span>
                    <span className="text-xs text-[#9CA3AF]">{label}</span>
                  </div>
                ))}
              </div>

              {/* Abstract */}
              {listing.abstract && (
                <Section title="About this Research" icon={FileText}>
                  <p className="text-sm text-[#4B5563] leading-relaxed">{listing.abstract}</p>
                </Section>
              )}

              {/* Media */}
              {listingWithMedia?.media_urls && listingWithMedia.media_urls.length > 0 && (
                <Section title="Media" icon={ImageIcon}>
                  <MediaViewer urls={listingWithMedia.media_urls} />
                </Section>
              )}

              {/* Collaborators */}
              {listing.collaborators && listing.collaborators.length > 0 && (
                <Section title="Contributors" icon={Users} defaultOpen={false}>
                  <div className="space-y-3">
                    {listing.collaborators.map(c => (
                      <div key={c.id} className="flex items-center justify-between p-3 bg-[#FDFBF7] rounded-xl border border-[#E8DDD0]">
                        <div>
                          <p className="text-sm font-semibold text-[#1F2937]">{c.profiles?.full_name ?? 'Unknown'}</p>
                          {c.contribution && <p className="text-xs text-[#9CA3AF] mt-0.5">{c.contribution}</p>}
                        </div>
                        {c.credit_share != null && (
                          <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-medium">
                            {c.credit_share}% credit
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Collaboration CTA */}
              {listing.status === 'open_for_collaboration' && userId && userId !== listing.author_id && (
                <div className="flex items-start gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                  <UserPlus className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-bold text-blue-900">This research is open for collaboration</p>
                    <p className="text-sm text-blue-700 mt-1 mb-3 leading-relaxed">Contribute your expertise and receive intellectual credit for your work.</p>
                    <a href={`/research/collaborate/${listing.id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors">
                      <UserPlus className="h-4 w-4" aria-hidden="true" />
                      Apply to Collaborate
                    </a>
                  </div>
                </div>
              )}

              {/* License selector */}
              <Section title="License Type" icon={BookMarked}>
                <LicenseSelector value={selectedLicense ?? 'cc_by'} onChange={setSelectedLicense} />
                {listing.license_type && (
                  <p className="text-xs text-[#9CA3AF] mt-2">
                    Published under: <span className="font-semibold text-[#4B5563]">{LICENSE_TYPE_LABELS[listing.license_type]}</span>
                  </p>
                )}
              </Section>

              {/* Protected record */}
              <ProtectedRecordBlock hash={listing.sha256_hash} />

              <p className="text-xs text-center text-[#9CA3AF] pb-2">
                Published {formatDate(listing.created_at)}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {listing && !loading && (
          <div className="shrink-0 border-t border-[#E8DDD0] bg-white px-6 py-4 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-[#9CA3AF]">
                {listing.license_type ? LICENSE_TYPE_LABELS[listing.license_type] : 'License'}
              </span>
              <span className={cn('text-xl font-bold', listing.price === 0 ? 'text-[#15803D]' : 'text-[#1F2937]')}>
                {listing.price === 0
                  ? <span className="flex items-center gap-1.5"><Zap className="h-5 w-5" aria-hidden="true" />Free</span>
                  : `BWP ${listing.price.toFixed(2)}`
                }
              </span>
            </div>

            {listing.full_document_url ? (
              <button
                onClick={handleDownload}
                disabled={downloading}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all shadow-sm',
                  'bg-[#9A3412] hover:bg-[#7C2D12] text-white',
                  'disabled:opacity-60 disabled:cursor-not-allowed'
                )}
                aria-busy={downloading}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                {downloading ? 'Preparing…' : listing.price === 0 ? 'Download Free' : 'Purchase & Download'}
              </button>
            ) : (
              <div className="w-full py-3 rounded-xl text-sm text-[#9CA3AF] text-center border-2 border-dashed border-[#E8DDD0] bg-[#FDFBF7]">
                Document not yet available
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleCite} disabled={citing}
                className={cn('flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all',
                  citing
                    ? 'border-[#15803D] bg-[#F0FDF4] text-[#15803D]'
                    : 'border-[#E8DDD0] bg-[#FDFBF7] text-[#4B5563] hover:border-[#9A3412] hover:text-[#9A3412]'
                )} aria-busy={citing}>
                {citing ? <><Check className="h-4 w-4" aria-hidden="true" /> Cited!</> : <><BookMarked className="h-4 w-4" aria-hidden="true" /> Cite</>}
              </button>
              <a href={`/research/${listing.id}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border-2 border-[#E8DDD0] bg-[#FDFBF7] text-[#4B5563] hover:border-[#9A3412] hover:text-[#9A3412] transition-all">
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Full Page
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
