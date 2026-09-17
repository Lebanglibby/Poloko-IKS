'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  X, Shield, Copy, Check, ExternalLink,
  FileText, MapPin, CheckCircle2, Clock, Tag,
  Image as ImageIcon, ChevronDown, ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate, formatRelativeDate } from '@/lib/utils'
import { KNOWLEDGE_CATEGORY_LABELS } from '@/lib/constants'
import { AccessTierBadge } from '@/components/vault/AccessTierBadge'
import { AccessRequestForm } from '@/components/vault/AccessRequestForm'
import { VerifyEntryButton } from '@/components/vault/VerifyEntryButton'
import { useToast } from '@/components/shared/ToastProvider'
import type { KnowledgeEntry } from '@/lib/types'

/* ─── Skeleton ──────────────────────────────────────────────────────────────── */
function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6" aria-hidden="true">
      <div className="skeleton h-6 w-3/4 rounded" />
      <div className="skeleton h-4 w-1/3 rounded" />
      <div className="skeleton h-5 w-24 rounded-full" />
      <div className="skeleton h-20 w-full rounded" />
      <div className="skeleton h-28 w-full rounded-xl" />
      <div className="skeleton h-24 w-full rounded-xl" />
    </div>
  )
}

/* ─── Hash display ──────────────────────────────────────────────────────────── */
function HashDisplay({ hash }: { hash: string }) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const btnRef = useRef<HTMLButtonElement>(null)

  async function copyHash() {
    await navigator.clipboard.writeText(hash)
    setCopied(true)
    btnRef.current?.classList.add('hash-copied')
    toast({ type: 'success', message: 'Hash copied', description: `${hash.slice(0, 16)}…` })
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
          <span className="text-xs font-semibold text-emerald-300">Biopiracy Shield — SHA-256</span>
        </div>
        <button
          ref={btnRef}
          onClick={copyHash}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border',
            copied
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : 'bg-slate-700 text-slate-300 border-slate-600 hover:border-emerald-500/30 hover:text-emerald-300'
          )}
          aria-label={copied ? 'Hash copied' : 'Copy SHA-256 hash to clipboard'}
        >
          {copied
            ? <><Check className="h-3 w-3" aria-hidden="true" /> Copied</>
            : <><Copy className="h-3 w-3" aria-hidden="true" /> Copy</>
          }
        </button>
      </div>
      <p
        className="font-mono text-[11px] text-emerald-400/80 break-all leading-relaxed select-all"
        aria-label="SHA-256 hash"
      >
        {hash}
      </p>
      <p className="text-[10px] text-slate-500 mt-2">
        Immutable cryptographic fingerprint. Timestamped at submission — protects against biopiracy claims.
      </p>
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
  const id = `vault-section-${title.replace(/\s+/g, '-').toLowerCase()}`
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

/* ─── Media viewer (light version — images only for vault) ──────────────────── */
function MediaStrip({ urls }: { urls: string[] }) {
  const [active, setActive] = useState(0)
  if (!urls.length) return null
  return (
    <div className="rounded-xl border border-slate-700 overflow-hidden">
      <div className="relative aspect-video bg-slate-950 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={urls[active]}
          alt={`Knowledge media ${active + 1}`}
          className="w-full h-full object-contain"
        />
        <a
          href={urls[active]}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white/70 hover:text-white hover:bg-black/70 transition-colors"
          aria-label="Open image in new tab"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
      {urls.length > 1 && (
        <div className="flex gap-2 p-2 bg-slate-900 border-t border-slate-800 overflow-x-auto" role="tablist">
          {urls.map((u, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={active === i}
              onClick={() => setActive(i)}
              className={cn(
                'shrink-0 h-10 w-14 rounded-lg border overflow-hidden transition-all',
                active === i ? 'border-emerald-500/50 ring-1 ring-emerald-500/30' : 'border-slate-700 hover:border-slate-600'
              )}
              aria-label={`Image ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" className="h-full w-full object-cover" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Main drawer ───────────────────────────────────────────────────────────── */
interface Props {
  entry: KnowledgeEntry | null
  isOpen: boolean
  onClose: () => void
  userId?: string | null
  userRole?: string | null
}

export function VaultDetailDrawer({ entry, isOpen, onClose, userId, userRole }: Props) {
  const [loading, setLoading] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const closeRef  = useRef<HTMLButtonElement>(null)

  /* Focus trap + Escape */
  useEffect(() => {
    if (!isOpen) return
    const prev = document.activeElement as HTMLElement
    setTimeout(() => closeRef.current?.focus(), 50)

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab' || !drawerRef.current) return
      const els = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])'
      )
      const first = els[0]; const last = els[els.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); prev?.focus() }
  }, [isOpen, onClose])

  /* Short loading shimmer when entry changes */
  useEffect(() => {
    if (entry) {
      setLoading(true)
      const t = setTimeout(() => setLoading(false), 250)
      return () => clearTimeout(t)
    }
  }, [entry?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const canVerify = !!userId && userId !== entry?.submitted_by && entry?.access_tier === 'public'
  const canView   = entry?.access_tier === 'public'
  const needsRequest = entry && (entry.access_tier === 'restricted' || entry.access_tier === 'sacred')

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={entry ? `Entry: ${entry.title}` : 'Knowledge entry details'}
        className={cn(
          'fixed right-0 top-0 bottom-0 z-[70] flex flex-col',
          'w-full sm:w-[480px] lg:w-[520px]',
          'bg-slate-900 border-l border-slate-700 shadow-2xl shadow-black/60',
          isOpen ? 'drawer-enter' : 'drawer-exit'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 flex items-center justify-center rounded-md bg-emerald-500/15 border border-emerald-500/25">
              <FileText className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold text-slate-100">Entry Details</span>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Close entry details"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {loading || !entry ? (
            <DrawerSkeleton />
          ) : (
            <div className="p-5 space-y-4">

              {/* Title + tier */}
              <div>
                <div className="flex items-start gap-3 mb-2">
                  <h2 className="flex-1 text-base font-bold text-slate-100 leading-snug">
                    {entry.title}
                  </h2>
                  <AccessTierBadge tier={entry.access_tier} variant="badge" className="shrink-0" />
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md text-slate-300 text-[10px] font-medium">
                    {KNOWLEDGE_CATEGORY_LABELS[entry.category]}
                  </span>
                  {entry.verified ? (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-400">
                      <Clock className="h-3 w-3" aria-hidden="true" /> Pending verification
                    </span>
                  )}
                  <span className="text-slate-600">{formatRelativeDate(entry.created_at)}</span>
                </div>

                {/* Submitter */}
                {entry.profiles?.full_name && (
                  <p className="text-xs text-slate-500 mt-1.5">
                    Submitted by{' '}
                    <span className="text-slate-300 font-medium">{entry.profiles.full_name}</span>
                    {entry.profiles.community && ` · ${entry.profiles.community}`}
                  </p>
                )}

                {/* Tags */}
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3" aria-label="Tags">
                    {entry.tags.map(tag => (
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

              {/* Access tier banner */}
              <AccessTierBadge tier={entry.access_tier} variant="banner" />

              {/* Description — only if accessible */}
              {canView && entry.description && (
                <Section title="Description" icon={FileText}>
                  <p className="text-sm text-slate-300 leading-relaxed">{entry.description}</p>
                </Section>
              )}

              {/* Media */}
              {canView && entry.media_urls && entry.media_urls.length > 0 && (
                <Section title="Media" icon={ImageIcon}>
                  <MediaStrip urls={entry.media_urls} />
                </Section>
              )}

              {/* Location */}
              {canView && entry.latitude && entry.longitude && (
                <Section title="Location" icon={MapPin} defaultOpen={false}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                      {entry.access_tier === 'public'
                        ? `${entry.latitude.toFixed(4)}°, ${entry.longitude.toFixed(4)}°`
                        : 'Exact coordinates hidden for this access tier.'
                      }
                    </p>
                    <a
                      href={`/map?highlight=${entry.id}`}
                      className="text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors"
                      aria-label="View on interactive map"
                    >
                      View on map →
                    </a>
                  </div>
                </Section>
              )}

              {/* Access request form (restricted / sacred) */}
              {needsRequest && (
                <Section
                  title={entry.access_tier === 'sacred' ? 'Request Elder Approval' : 'Request Access'}
                  icon={entry.access_tier === 'sacred' ? Shield : FileText}
                >
                  <AccessRequestForm
                    entryId={entry.id}
                    tier={entry.access_tier}
                    isAuthenticated={!!userId}
                  />
                </Section>
              )}

              {/* Community verification */}
              {canVerify && (
                <Section title="Community Verification" icon={CheckCircle2} defaultOpen={false}>
                  <p className="text-xs text-slate-400 mb-3">
                    As a community member, you can verify the accuracy of this knowledge entry.
                  </p>
                  <VerifyEntryButton entryId={entry.id} />
                </Section>
              )}

              {/* Biopiracy shield */}
              <HashDisplay hash={entry.sha256_hash} />

              {/* Published date */}
              <p className="text-xs text-slate-500 text-center">
                Published {formatDate(entry.created_at)}
                {entry.updated_at !== entry.created_at && ` · Updated ${formatRelativeDate(entry.updated_at)}`}
              </p>
            </div>
          )}
        </div>

        {/* Action footer */}
        {entry && !loading && (
          <div className="shrink-0 border-t border-slate-700/60 bg-slate-900/95 backdrop-blur-sm p-4">
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`/vault/${entry.id}`}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                aria-label="Open full entry page"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                Full Entry
              </a>
              <a
                href={`/map?highlight=${entry.id}`}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white transition-colors"
                aria-label="View on interactive map"
              >
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                View on Map
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
