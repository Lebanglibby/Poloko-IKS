'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  X, Shield, Copy, Check, ExternalLink, FileText,
  MapPin, CheckCircle2, Clock, Tag, ChevronDown, ChevronUp,
  Image as ImageIcon, Lock,
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
    <div className="p-6 space-y-4" aria-hidden="true">
      <div className="skeleton h-7 w-4/5 rounded-xl" />
      <div className="skeleton h-5 w-1/3 rounded-full" />
      <div className="skeleton h-6 w-40 rounded-full" />
      <div className="skeleton h-24 w-full rounded-2xl" />
      <div className="skeleton h-32 w-full rounded-2xl" />
      <div className="skeleton h-20 w-full rounded-2xl" />
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
    toast({ type: 'success', message: 'Record ID copied', description: 'The unique record identifier has been copied.' })
    setTimeout(() => { setCopied(false); btnRef.current?.classList.remove('hash-copied') }, 2500)
  }

  return (
    <div className="rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
          <Shield className="h-4 w-4 text-[#15803D]" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#14532D]">Verified & Protected Heritage Record</p>
          <p className="text-xs text-[#15803D] mt-0.5">
            This entry has a unique tamper-proof identifier registered at the time of submission.
          </p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-[#BBF7D0] p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">Unique Record ID</span>
          <button
            ref={btnRef}
            onClick={copyHash}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all',
              copied
                ? 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]'
                : 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0] hover:bg-[#DCFCE7]'
            )}
            aria-label={copied ? 'Copied!' : 'Copy record identifier'}
          >
            {copied ? <><Check className="h-3 w-3" aria-hidden="true" /> Copied!</> : <><Copy className="h-3 w-3" aria-hidden="true" /> Copy</>}
          </button>
        </div>
        <p className="font-mono text-[10px] text-[#4B5563] break-all leading-relaxed select-all">
          {hash}
        </p>
      </div>
    </div>
  )
}

/* ─── Collapsible section ───────────────────────────────────────────────────── */
function Section({
  title, icon: Icon, defaultOpen = true, children,
}: { title: string; icon: typeof Shield; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  const id = `vault-sec-${title.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <div className="rounded-2xl border border-[#E8DDD0] bg-white overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#FDFBF7] transition-colors text-left"
        aria-expanded={open}
        aria-controls={id}
      >
        <span className="flex items-center gap-2.5 text-sm font-semibold text-[#1F2937]">
          <Icon className="h-4 w-4 text-[#9CA3AF]" aria-hidden="true" />
          {title}
        </span>
        {open
          ? <ChevronUp className="h-4 w-4 text-[#9CA3AF]" aria-hidden="true" />
          : <ChevronDown className="h-4 w-4 text-[#9CA3AF]" aria-hidden="true" />
        }
      </button>
      {open && <div id={id} className="px-5 pb-5 space-y-3">{children}</div>}
    </div>
  )
}

/* ─── Media strip ───────────────────────────────────────────────────────────── */
function MediaStrip({ urls }: { urls: string[] }) {
  const [active, setActive] = useState(0)
  if (!urls.length) return null
  return (
    <div className="rounded-2xl border border-[#E8DDD0] overflow-hidden bg-[#FDFBF7]">
      <div className="relative aspect-video bg-[#F3F0EB] flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={urls[active]} alt={`Media ${active + 1}`} className="w-full h-full object-contain" />
        <a
          href={urls[active]}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/80 text-[#4B5563] hover:text-[#9A3412] border border-[#E8DDD0] transition-colors"
          aria-label="Open image in new tab"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
      {urls.length > 1 && (
        <div className="flex gap-2 p-3 border-t border-[#E8DDD0] overflow-x-auto" role="tablist">
          {urls.map((u, i) => (
            <button key={i} role="tab" aria-selected={active === i} onClick={() => setActive(i)}
              className={cn('shrink-0 h-12 w-16 rounded-xl border-2 overflow-hidden transition-all',
                active === i ? 'border-[#9A3412]' : 'border-[#E8DDD0] hover:border-[#D4C4B0]'
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
    if (entry) {
      setLoading(true)
      const t = setTimeout(() => setLoading(false), 200)
      return () => clearTimeout(t)
    }
  }, [entry?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const canVerify    = !!userId && userId !== entry?.submitted_by && entry?.access_tier === 'public'
  const canView      = entry?.access_tier === 'public'
  const needsRequest = entry && (entry.access_tier === 'restricted' || entry.access_tier === 'sacred')

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[60] bg-[#1F2937]/40 backdrop-blur-[2px]" aria-hidden="true" onClick={onClose} />

      {/* Panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={entry ? entry.title : 'Entry details'}
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
              <FileText className="h-4.5 w-4.5 text-[#9A3412]" style={{ width: 18, height: 18 }} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1F2937]">Knowledge Entry</p>
              <p className="text-xs text-[#9CA3AF]">Poloko IKS Heritage Archive</p>
            </div>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            className="p-2 rounded-xl text-[#9CA3AF] hover:text-[#9A3412] hover:bg-[#FEF9F0] transition-colors border border-transparent hover:border-[#E8DDD0]"
            aria-label="Close entry details"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {loading || !entry ? (
            <DrawerSkeleton />
          ) : (
            <div className="p-6 space-y-5">

              {/* Title + meta */}
              <div>
                <h2 className="text-xl font-bold text-[#1F2937] leading-snug mb-2">
                  {entry.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-sm text-[#4B5563]">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F3F0EB] text-[#4B5563] text-xs font-medium">
                    {KNOWLEDGE_CATEGORY_LABELS[entry.category]}
                  </span>
                  {entry.verified ? (
                    <span className="flex items-center gap-1 text-[#15803D] text-xs font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Verified Record
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[#B45309] text-xs font-medium">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Awaiting verification
                    </span>
                  )}
                  <span className="text-[#9CA3AF] text-xs ml-auto">{formatRelativeDate(entry.created_at)}</span>
                </div>

                {entry.profiles?.full_name && (
                  <p className="text-sm text-[#9CA3AF] mt-2">
                    Submitted by <span className="text-[#4B5563] font-medium">{entry.profiles.full_name}</span>
                    {entry.profiles.community && ` · ${entry.profiles.community}`}
                  </p>
                )}

                {/* Tags */}
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3" aria-label="Tags">
                    {entry.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 bg-[#F3F0EB] text-[#4B5563] text-xs px-2.5 py-1 rounded-full">
                        <Tag className="h-3 w-3 text-[#9CA3AF]" aria-hidden="true" />{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Access tier banner */}
              <AccessTierBadge tier={entry.access_tier} variant="banner" />

              {/* Description */}
              {canView && entry.description && (
                <Section title="About this entry" icon={FileText}>
                  <p className="text-sm text-[#4B5563] leading-relaxed">{entry.description}</p>
                </Section>
              )}

              {/* Media */}
              {canView && entry.media_urls && entry.media_urls.length > 0 && (
                <Section title="Photos & Media" icon={ImageIcon}>
                  <MediaStrip urls={entry.media_urls} />
                </Section>
              )}

              {/* Location */}
              {canView && entry.latitude && entry.longitude && (
                <Section title="Location" icon={MapPin} defaultOpen={false}>
                  <div className="flex items-center justify-between bg-[#FDFBF7] rounded-xl border border-[#E8DDD0] p-3">
                    <p className="text-sm text-[#4B5563]">
                      {entry.access_tier === 'public'
                        ? `${entry.latitude.toFixed(4)}°N, ${entry.longitude.toFixed(4)}°E`
                        : 'Exact location is protected for this entry.'
                      }
                    </p>
                    <a href={`/map?highlight=${entry.id}`} className="text-sm font-semibold text-[#9A3412] hover:underline">
                      View on map →
                    </a>
                  </div>
                </Section>
              )}

              {/* Access request */}
              {needsRequest && (
                <Section
                  title={entry.access_tier === 'sacred' ? 'Request Elder Board Approval' : 'Request Access'}
                  icon={entry.access_tier === 'sacred' ? Shield : Lock}
                >
                  <AccessRequestForm entryId={entry.id} tier={entry.access_tier} isAuthenticated={!!userId} />
                </Section>
              )}

              {/* Community verification */}
              {canVerify && (
                <Section title="Help Verify This Entry" icon={CheckCircle2} defaultOpen={false}>
                  <p className="text-sm text-[#4B5563] leading-relaxed mb-3">
                    As a community member, you can confirm the accuracy of this knowledge entry and help build trust in the archive.
                  </p>
                  <VerifyEntryButton entryId={entry.id} />
                </Section>
              )}

              {/* Protected record */}
              <ProtectedRecordBlock hash={entry.sha256_hash} />

              <p className="text-xs text-center text-[#9CA3AF] pb-2">
                Added to archive on {formatDate(entry.created_at)}
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {entry && !loading && (
          <div className="shrink-0 border-t border-[#E8DDD0] bg-white px-6 py-4">
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`/vault/${entry.id}`}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-[#9A3412] hover:bg-[#7C2D12] text-white transition-colors shadow-sm"
                aria-label="Open full entry page"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                View Full Entry
              </a>
              <a
                href={`/map?highlight=${entry.id}`}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-[#FDFBF7] border-2 border-[#E8DDD0] text-[#4B5563] hover:border-[#9A3412] hover:text-[#9A3412] transition-colors"
                aria-label="View on map"
              >
                <MapPin className="h-4 w-4" aria-hidden="true" />
                See on Map
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
