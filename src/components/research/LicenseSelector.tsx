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
  cc_by: 'Free to use with attribution. Most permissive open license.',
  cc_by_sa: 'Free to use with attribution; derivative works must share alike.',
  odc_by: 'Open Data Commons — for datasets and databases.',
  commercial: 'Set your own price and royalty terms.',
  custom: 'Define bespoke licensing terms in your own words.',
}

export function LicenseSelector({ value, onChange, className }: Props) {
  return (
    <div className={cn('space-y-2', className)}>
      {(Object.entries(LICENSE_TYPE_LABELS) as [LicenseType, string][]).map(([type, label]) => (
        <label
          key={type}
          className={cn(
            'flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors',
            value === type
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          )}
        >
          <input
            type="radio"
            name="license_type"
            value={type}
            checked={value === type}
            onChange={() => onChange(type)}
            className="mt-0.5 accent-blue-600"
          />
          <div>
            <p className={cn('text-sm font-medium', value === type ? 'text-blue-900' : 'text-gray-800')}>
              {label}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{LICENSE_DESCRIPTIONS[type]}</p>
          </div>
        </label>
      ))}
    </div>
  )
}
