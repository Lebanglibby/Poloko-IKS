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
    <div className="flex flex-col gap-4 p-6 animate-pulse" aria-hidden="true">
      <div className="skeleton h-6 w-3/4 rounded" />
      <div className="skeleton h-4 w-1/3 rounded" />
      <div className="skeleton h-20 w-full rounded" />
      <div className="skeleton h-32 w-full rounded-xl" />
      <div className="skeleton h-24 w-full rounded-xl" />
      <div className="skeleton h-10 w-full rounded-xl" />
    </div>
  )
}

/* ─── Hash copy button ──────────────────────────────────────────────────────── */
function HashDisplay({ hash, label = 'SHA-256' }: { hash: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const btnRef = useRef<HTMLButtonElement>(null)

  async function copyHash() {
    await navigator.clipboard.writeText(hash)
    setCopied(true)
    btnRef.current?.classList.add('hash-copied')
    toast({ type: 'success', message: 'Hash copied to clipboard', description: `${hash.slice(0, 16)}…` })
    setTimeout(() => {
      setCopied(false)
      btnRef.current?.classList.remove('hash-copied')
    }, 2000)
  }

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-emerald-400" aria-hidden="true" />
          <span className="text-xs font-semibold text-emerald-300">{label} Timestamp Proof</span>
        </div>
        <button
          ref={btnRef}
          onClick={copyHash}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all',
            copied
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-slate-700 text-slate-300 border border-slate-600 hover:border-emerald-500/30 hover:text-emerald-300'
          )}
          aria-label={copied ? 'Hash copied' : 'Copy SHA-256 hash'}
        >
          {copied
            ? <><Check className="h-3 w-3" aria-hidden="true" /> Copied</>
            : <><Copy className="h-3 w-3" aria-hidden="true" /> Copy</>
          }
        </button>
      </div>
      <p
        className="font-mono text-[11px] text-emerald-400/80 break-all leading-relaxed select-all"
        aria-label="SHA-256 hash value"
      >
        {hash}
      </p>
      <p className="text-[10px] text-slate-500 mt-2">
        Immutable proof of authorship registered at time of submission. Verifiable against the original document.
      </p>
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
    <div className="rounded-xl border border-slate-700 overflow-hidden bg-slate-900">
      {/* Main viewer */}
      <div className="relative aspect-video bg-slate-950 flex items-center justify-center">
        {isVideo ? (
          <video
            src={url}
            controls
            className="w-full h-full object-contain"
            aria-label="Research media video"
          />
        ) : isAudio ? (
          <div className="flex flex-col items-center gap-3 p-6">
            <Film className="h-10 w-10 text-slate-600" aria-hidden="true" />
            <audio src={url} controls className="w-full" aria-label="Research media audio" />
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={`Research media ${active + 1}`}
            className="w-full h-full object-contain"
          />
        )}

        {/* Open externally */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white/70 hover:text-white hover:bg-black/70 transition-colors"
          aria-label="Open media in new tab"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>

      {/* Thumbnail strip */}
      {urls.length > 1 && (
        <div className="flex gap-2 p-2 bg-slate-900 border-t border-slate-800 overflow-x-auto" role="tablist" aria-label="Media thumbnails">
          {urls.map((u, i) => {
            const isImg = !['mp4','webm','mov','mp3','wav','ogg','m4a'].includes(u.split('.').pop()?.toLowerCase() ?? '')
            return (
              <button
                key={i}
                role="tab"
                aria-selected={active === i}
                onClick={() => setActive(i)}
                className={cn(
                  'shrink-0 h-12 w-16 rounded-lg border overflow-hidden flex items-center justify-center transition-all',
                  active === i
                    ? 'border-emerald-500/50 ring-1 ring-emerald-500/30'
                    : 'border-slate-700 hover:border-slate-600'
                )}
                aria-label={`Media item ${i + 1}`}
              >
                {isImg
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={u} alt="" className="h-full w-full object-cover" aria-hidden="true" />
                  : <ImageIcon className="h-4 w-4 text-slate-500" aria-hidden="true" />
                }
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ─── Collapsible section ───────────────────────────────────────────────────── */
function Section({
  title, icon: Icon, defaultOpen = true, children,
}: {
  title: string
  icon: typeof Shield
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const id = `section-${title.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <div className="rounded-xl border border-slate-700/60 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/60 hover:bg-slate-800 transition-colors text-left"
        aria-expanded={open}
        aria-controls={id}
      >
        <span className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wide">
          <Icon className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          {title}
        </span>
        {open
          ? <ChevronUp className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
          : <ChevronDown className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
        }
      </button>
      {open && (
        <div id={id} className="p-4 bg-slate-900/40 space-y-3">
          {children}
        </div>
      )}
    </div>
  )
}

/* ─── Main Drawer ───────────────────────────────────────────────────────────── */
interface DrawerProps {
  listing: ResearchListing | null
  isOpen: boolean
  onClose: () => void
  userRole?: string | null
  userId?: string | null
}

export function ResearchDetailDrawer({ listing, isOpen, onClose, userRole, userId }: DrawerProps) {
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [citing, setCiting] = useState(false)
  const [selectedLicense, setSelectedLicense] = useState<LicenseType | null>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const { toast } = useToast()

  /* Focus trap & escape key */
  useEffect(() => {
    if (!isOpen) return
    const prev = document.activeElement as HTMLElement
    setTimeout(() => closeRef.current?.focus(), 50)

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()

      /* Basic focus trap */
      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
        const first = focusable[0]
        const last  = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      prev?.focus()
    }
  }, [isOpen, onClose])

  /* Reset per-listing state when listing changes */
  useEffect(() => {
    if (listing) {
      setSelectedLicense(listing.license_type ?? null)
      setLoading(true)
      const t = setTimeout(() => setLoading(false), 300)
      return () => clearTimeout(t)
    }
  }, [listing?.id])  // eslint-disable-line react-hooks/exhaustive-deps

  const handleDownload = useCallback(async () => {
    if (!listing?.full_document_url || !listing?.id) return
    setDownloading(true)
    try {
      await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listing.id }),
      })
      window.open(listing.full_document_url, '_blank', 'noopener,noreferrer')
      toast({
        type: 'success',
        message: listing.price === 0 ? 'Download started' : 'Purchase successful',
        description: listing.title,
      })
    } catch {
      toast({ type: 'error', message: 'Download failed. Please try again.' })
    } finally {
      setDownloading(false)
    }
  }, [listing, toast])

  const handleCite = useCallback(async () => {
    if (!listing) return
    setCiting(true)

    const citation = [
      listing.profiles?.full_name ?? 'Unknown Author',
      `(${new Date(listing.created_at).getFullYear()})`,
      listing.title + '.',
      'Poloko IKS Research Hub.',
      `SHA-256: ${listing.sha256_hash.slice(0, 16)}…`,
    ].join(' ')

    try {
      await navigator.clipboard.writeText(citation)
      await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cite', target_type: 'research_listing', target_id: listing.id }),
      })
      toast({
        type: 'success',
        message: 'Citation copied',
        description: 'Formatted citation is now in your clipboard.',
      })
    } catch {
      toast({ type: 'error', message: 'Could not copy citation.' })
    } finally {
      setTimeout(() => setCiting(false), 1500)
    }
  }, [listing, toast])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={listing ? `Details: ${listing.title}` : 'Research details'}
        className={cn(
          'fixed right-0 top-0 bottom-0 z-[70] flex flex-col',
          'w-full sm:w-[480px] lg:w-[520px]',
          'bg-slate-900 border-l border-slate-700',
          'shadow-2xl shadow-black/60',
          isOpen ? 'drawer-enter' : 'drawer-exit'
        )}
      >
        {/* ── Drawer header ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 flex items-center justify-center rounded-md bg-emerald-500/15 border border-emerald-500/25">
              <FileText className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold text-slate-100">Research Details</span>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Close details panel"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* ── Scrollable content ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {loading || !listing ? (
            <DrawerSkeleton />
          ) : (
            <div className="p-5 space-y-4">

              {/* Title + meta */}
              <div>
                <h2 className="text-base font-bold text-slate-100 leading-snug mb-1.5">
                  {listing.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  {listing.profiles?.full_name && (
                    <span className="font-medium text-slate-300">
                      {listing.profiles.full_name}
                    </span>
                  )}
                  {listing.profiles?.community && (
                    <>
                      <span className="text-slate-600" aria-hidden="true">·</span>
                      <span>{listing.profiles.community}</span>
                    </>
                  )}
                  <span className="text-slate-600" aria-hidden="true">·</span>
                  <span>{formatRelativeDate(listing.created_at)}</span>
                </div>

                {/* Tags */}
                {listing.tags && listing.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3" aria-label="Tags">
                    {listing.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded border border-slate-700"
                      >
                        <Tag className="h-2.5 w-2.5" aria-hidden="true" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Abstract */}
              {listing.abstract && (
                <Section title="Abstract" icon={FileText}>
                  <p className="text-sm text-slate-300 leading-relaxed">{listing.abstract}</p>
                </Section>
              )}

              {/* Media viewer — media_urls is present on knowledge entries referenced via listing */}
              {(listing as ResearchListing & { media_urls?: string[] }).media_urls?.length ? (
                <Section title="Media" icon={ImageIcon}>
                  <MediaViewer urls={(listing as ResearchListing & { media_urls?: string[] }).media_urls!} />
                </Section>
              ) : null}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Views',    value: listing.view_count,     icon: Eye },
                  { label: 'Downloads', value: listing.download_count, icon: Download },
                  { label: 'Collaborators', value: listing.collaborators?.length ?? 0, icon: Users },
                ].map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60"
                  >
                    <Icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
                    <span className="text-base font-bold text-slate-100 tabular-nums">
                      {value.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500">{label}</span>
                  </div>
                ))}
              </div>

              {/* Collaborators list */}
              {listing.collaborators && listing.collaborators.length > 0 && (
                <Section title="Contributors" icon={Users} defaultOpen={false}>
                  <div className="space-y-2.5">
                    {listing.collaborators.map(c => (
                      <div key={c.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-200">{c.profiles?.full_name ?? 'Unknown'}</p>
                          {c.contribution && (
                            <p className="text-xs text-slate-500 mt-0.5">{c.contribution}</p>
                          )}
                        </div>
                        {c.credit_share != null && (
                          <span className="text-xs bg-blue-500/15 text-blue-400 border border-blue-500/25 px-2 py-0.5 rounded-full">
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
                <div className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                  <UserPlus className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-blue-300">Open for collaboration</p>
                    <p className="text-xs text-slate-400 mt-0.5 mb-3">
                      Contribute your expertise and receive intellectual credit.
                    </p>
                    <a
                      href={`/research/collaborate/${listing.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
                      Apply to Collaborate
                    </a>
                  </div>
                </div>
              )}

              {/* License selector */}
              <Section title="License" icon={BookMarked}>
                <LicenseSelector
                  value={selectedLicense ?? 'cc_by'}
                  onChange={setSelectedLicense}
                />
                {listing.license_type && (
                  <p className="text-[10px] text-slate-500 mt-2">
                    Published under: <span className="text-slate-400 font-medium">
                      {LICENSE_TYPE_LABELS[listing.license_type]}
                    </span>
                  </p>
                )}
              </Section>

              {/* SHA-256 proof */}
              <HashDisplay hash={listing.sha256_hash} label="Proof of Authorship" />

              {/* Published date */}
              <p className="text-xs text-slate-500 text-center">
                Published {formatDate(listing.created_at)}
                {listing.updated_at !== listing.created_at && ` · Updated ${formatRelativeDate(listing.updated_at)}`}
              </p>
            </div>
          )}
        </div>

        {/* ── Sticky action footer ────────────────────────────────────────── */}
        {listing && !loading && (
          <div className="shrink-0 border-t border-slate-700/60 bg-slate-900/95 backdrop-blur-sm p-4 space-y-2">
            {/* Price display */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">
                {listing.license_type ? LICENSE_TYPE_LABELS[listing.license_type] : 'License'}
              </span>
              <span className={cn(
                'text-base font-bold',
                listing.price === 0 ? 'text-emerald-400' : 'text-slate-100'
              )}>
                {listing.price === 0
                  ? <span className="flex items-center gap-1"><Zap className="h-4 w-4" aria-hidden="true" />Free</span>
                  : `BWP ${listing.price.toFixed(2)}`
                }
              </span>
            </div>

            {/* Primary: Download */}
            {listing.full_document_url ? (
              <button
                onClick={handleDownload}
                disabled={downloading}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all',
                  'bg-emerald-600 hover:bg-emerald-500 text-white',
                  'disabled:opacity-60 disabled:cursor-not-allowed',
                  downloading && 'animate-pulse'
                )}
                aria-busy={downloading}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                {downloading ? 'Preparing…' : listing.price === 0 ? 'Download Free' : 'Purchase & Download'}
              </button>
            ) : (
              <div className="w-full py-2.5 rounded-xl text-sm text-slate-500 text-center border border-dashed border-slate-700">
                Document not yet uploaded
              </div>
            )}

            {/* Secondary: Cite + View full page */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCite}
                disabled={citing}
                className={cn(
                  'flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all border',
                  citing
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white'
                )}
                aria-busy={citing}
              >
                {citing
                  ? <><Check className="h-3.5 w-3.5" aria-hidden="true" /> Cited!</>
                  : <><BookMarked className="h-3.5 w-3.5" aria-hidden="true" /> Cite</>
                }
              </button>
              <a
                href={`/research/${listing.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white transition-all"
                aria-label="Open full research page in new tab"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                Full Page
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
