'use client'

import { LICENSE_TYPE_LABELS } from '@/lib/constants'
import type { LicenseType } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  value: LicenseType
  onChange: (value: LicenseType) => void
  className?: string
}

const LICENSE_DESCRIPTIONS: Record<LicenseType, string> = {
  cc_by:      'Free to use with attribution. The most open license — share and adapt freely.',
  cc_by_sa:   'Free to use with attribution; derivative works must keep the same license terms.',
  odc_by:     'Open Data Commons — designed specifically for datasets and databases.',
  commercial: 'Set your own price and royalty terms. Buyers pay to access your research.',
  custom:     'Define your own bespoke licensing agreement with tailored terms.',
}

/* Icon character per license — decorative, aria-hidden */
const LICENSE_ICON: Record<LicenseType, string> = {
  cc_by:      '◎',
  cc_by_sa:   '⟳',
  odc_by:     '⊡',
  commercial: '◈',
  custom:     '◇',
}

export function LicenseSelector({ value, onChange, className }: Props) {
  return (
    <div className={cn('space-y-2', className)} role="radiogroup" aria-label="Select license type">
      {(Object.entries(LICENSE_TYPE_LABELS) as [LicenseType, string][]).map(([type, label]) => {
        const active = value === type
        return (
          <label
            key={type}
            className={cn(
              'flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
              active
                ? 'border-[#2D6A4F] bg-[#F0F7F4]'
                : 'border-[#E8DDD0] bg-white hover:border-[#95D5B2] hover:bg-[#F7FBF8]'
            )}
          >
            <input
              type="radio"
              name="license_type"
              value={type}
              checked={active}
              onChange={() => onChange(type)}
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ accentColor: '#2D6A4F' }}
              aria-label={label}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'text-base font-bold leading-none',
                    active ? 'text-[#2D6A4F]' : 'text-[#9CA3AF]'
                  )}
                  aria-hidden="true"
                >
                  {LICENSE_ICON[type]}
                </span>
                <p className={cn('text-sm font-semibold', active ? 'text-[#2D6A4F]' : 'text-[#1F2937]')}>
                  {label}
                </p>
                {type === 'commercial' && (
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
                    Paid
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B5344] mt-1 leading-relaxed">
                {LICENSE_DESCRIPTIONS[type]}
              </p>
            </div>
          </label>
        )
      })}
    </div>
  )
}
