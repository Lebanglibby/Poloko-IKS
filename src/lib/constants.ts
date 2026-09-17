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

// ─── Module 3 — Learning Hub ─────────────────────────────────────────────────

export const COURSE_CATEGORY_LABELS = {
  traditional_crafts:    'Traditional Crafts',
  culinary_heritage:     'Culinary Heritage',
  cultural_arts:         'Cultural Arts',
  natural_building:      'Natural Building',
  ecological_practices:  'Ecological Practices',
  modern_fusion:         'Modern Fusion',
} as const

export const COURSE_CATEGORY_EMOJI = {
  traditional_crafts:    '🧺',
  culinary_heritage:     '🍲',
  cultural_arts:         '🥁',
  natural_building:      '🏡',
  ecological_practices:  '🌱',
  modern_fusion:         '✨',
} as const

export const SKILL_LEVEL_LABELS = {
  beginner:     'Beginner',
  intermediate: 'Intermediate',
  advanced:     'Advanced',
} as const

export const COURSE_STATUS_LABELS = {
  draft:          'Draft',
  pending_review: 'Pending Elder Review',
  approved:       'Elder Board Approved',
  rejected:       'Returned for Revision',
} as const

export const COURSE_STATUS_STYLES = {
  draft:          { bg: '#F3F0EB', text: '#6B5344',  border: '#E5D8C8'  },
  pending_review: { bg: '#FFFBEB', text: '#B45309',  border: '#FDE68A'  },
  approved:       { bg: '#F0F7F4', text: '#2D6A4F',  border: '#95D5B2'  },
  rejected:       { bg: '#FEF2F2', text: '#B91C1C',  border: '#FECACA'  },
} as const

export const LESSON_TYPE_LABELS = {
  video:         'Video',
  image_gallery: 'Photo Gallery',
  text:          'Step-by-Step Guide',
} as const

// Module 3 accent — warm amber-gold (distinct from M1 terracotta + M2 sage)
export const LEARNING_HUB_PRIMARY   = '#92400E'   // amber-800
export const LEARNING_HUB_MID       = '#B45309'   // amber-700
export const LEARNING_HUB_LIGHT     = '#FFFBEB'   // amber-50
export const LEARNING_HUB_BORDER    = '#FDE68A'   // amber-200
