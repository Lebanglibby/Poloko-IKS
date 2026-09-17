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
  cc_by:      'Free to use with attribution. The most open license.',
  cc_by_sa:   'Free to use with attribution; derivative works must keep the same license.',
  odc_by:     'Open Data Commons — for datasets and databases.',
  commercial: 'Set your own price and royalty terms.',
  custom:     'Define your own bespoke licensing agreement.',
}

export function LicenseSelector({ value, onChange, className }: Props) {
  return (
    <div className={cn('space-y-2', className)} role="radiogroup" aria-label="Select license type">
      {(Object.entries(LICENSE_TYPE_LABELS) as [LicenseType, string][]).map(([type, label]) => (
        <label
          key={type}
          className={cn(
            'flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
            value === type
              ? 'border-[#9A3412] bg-[#FEF9F0]'
              : 'border-[#E8DDD0] bg-white hover:border-[#D4C4B0] hover:bg-[#FDFBF7]'
          )}
        >
          <input
            type="radio"
            name="license_type"
            value={type}
            checked={value === type}
            onChange={() => onChange(type)}
            className="mt-0.5 accent-[#9A3412] h-4 w-4 shrink-0"
            aria-label={label}
          />
          <div>
            <p className={cn('text-sm font-semibold', value === type ? 'text-[#9A3412]' : 'text-[#1F2937]')}>
              {label}
            </p>
            <p className="text-xs text-[#4B5563] mt-0.5 leading-relaxed">
              {LICENSE_DESCRIPTIONS[type]}
            </p>
          </div>
        </label>
      ))}
    </div>
  )
}
