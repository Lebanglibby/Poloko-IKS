export const APP_NAME = 'Poloko IKS'
export const APP_TAGLINE = 'Preserving Botswana\'s Indigenous Knowledge for Future Generations'

export const ACCESS_TIER_LABELS = {
  public: 'Public',
  restricted: 'Restricted',
  sacred: 'Sacred',
} as const

export const ACCESS_TIER_COLORS = {
  public: 'bg-green-100 text-green-800 border-green-200',
  restricted: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  sacred: 'bg-red-100 text-red-800 border-red-200',
} as const

export const ACCESS_TIER_MAP_COLORS = {
  public: '#16a34a',    // green-600
  restricted: '#ca8a04', // yellow-600
  sacred: '#dc2626',     // red-600
} as const

export const KNOWLEDGE_CATEGORY_LABELS = {
  traditional_practice: 'Traditional Practice',
  flora_medicinal: 'Flora & Medicinal Plants',
  conservation: 'Conservation Technique',
  cultural_narrative: 'Cultural Narrative',
  resource_location: 'Resource Location',
} as const

export const LICENSE_TYPE_LABELS = {
  cc_by: 'CC BY (Creative Commons Attribution)',
  cc_by_sa: 'CC BY-SA (Attribution ShareAlike)',
  odc_by: 'ODC BY (Open Data Commons)',
  commercial: 'Commercial License',
  custom: 'Custom Terms',
} as const

export const USER_ROLE_LABELS = {
  community_member: 'Community Member',
  researcher: 'Researcher',
  elder: 'Community Elder',
  admin: 'Administrator',
} as const

export const BOTSWANA_CENTER: [number, number] = [-22.3285, 24.6849]
export const BOTSWANA_ZOOM = 6
