/**
 * Poloko IKS — Centralized Mock Data
 * ─────────────────────────────────────────────────────────────────────────────
 * Used in place of Supabase queries for the hackathon demo.
 * All three modules (Vault / Research / Learning Hub) pull from here.
 *
 * To switch to real data: replace the imports in each page.tsx with
 * the supabase createClient() calls from the original implementation.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type {
  KnowledgeEntry,
  ResearchListing,
  Course,
  Lesson,
  MediaItem,
  Profile,
} from '@/lib/types'

// ─── Shared mock profile ──────────────────────────────────────────────────────
export const MOCK_PROFILE: Profile = {
  id:         'demo-user-0001',
  full_name:  'Kabo Modise',
  role:       'researcher',
  community:  'University of Botswana',
  verified:   true,
  created_at: '2026-01-15T08:00:00Z',
}

export const MOCK_ELDER_PROFILE: Profile = {
  id:         'demo-elder-0001',
  full_name:  'Mmamogolo Setlhare',
  role:       'elder',
  community:  'Ngamiland District',
  verified:   true,
  created_at: '2025-06-01T08:00:00Z',
}

// ─── Module 1 — Knowledge Vault entries ──────────────────────────────────────
export const MOCK_ENTRIES: KnowledgeEntry[] = [
  {
    id:          'entry-0001',
    title:       'Morula Tree (Sclerocarya birrea) — Traditional Uses',
    description: 'The morula tree is one of Botswana\'s most culturally significant trees. Traditional communities harvest the fruit for making marula beer (khadi), a fermented beverage used in ceremonies. The kernel oil is used for skin moisturising and has anti-inflammatory properties. Bark decoctions are used for fever management and wound healing. The tree is considered sacred in some communities and felling is discouraged during fruiting season.',
    category:    'flora_medicinal',
    access_tier: 'public',
    language:    'en',
    submitted_by:'demo-elder-0001',
    verified:    true,
    verified_by: 'demo-elder-0001',
    sha256_hash: 'a3f5c8d2e1b4a7f6c9d0e3b2a1f4c7d8e2b5a8c3f6d1e4b7a0c5d2e8b3a6f9c1',
    // Central Kalahari Game Reserve — prime morula habitat
    latitude:    -21.7667,
    longitude:   23.9833,
    tags:        ['morula', 'medicinal', 'fruit', 'ceremony', 'Kalahari'],
    media_urls:  null,
    created_at:  '2026-02-10T10:30:00Z',
    updated_at:  '2026-02-10T10:30:00Z',
    profiles:    { full_name: 'Mmamogolo Setlhare', community: 'Ngamiland District' },
  },
  {
    id:          'entry-0002',
    title:       'Mokolwane Palm — Basket Weaving Traditions',
    description: 'The mokolwane palm (Hyphaene petersiana), found across the Okavango Delta and eastern Botswana, is the foundation of Botswana\'s internationally recognised basket-weaving tradition. Communities in Ngamiland harvest young palm leaves in the early morning to prevent wilting. The leaves are dried and dyed using natural plant dyes — berries of mophane for dark browns, roots of mosukudu for reds. Basket patterns encode clan identities and seasonal knowledge.',
    category:    'traditional_practice',
    access_tier: 'public',
    language:    'en',
    submitted_by:'demo-user-0001',
    verified:    true,
    verified_by: 'demo-elder-0001',
    sha256_hash: 'b4e7a2f5c8d1e3b6a9f2c5d8e1b4a7f0c3d6e9b2a5f8c1d4e7b0a3f6c9d2e5b8',
    // Etsha 6 village — famous basket-weaving community, Ngamiland
    latitude:    -19.6833,
    longitude:   22.8667,
    tags:        ['palm', 'weaving', 'Okavango', 'craft', 'Ngamiland'],
    media_urls:  null,
    created_at:  '2026-02-18T14:00:00Z',
    updated_at:  '2026-02-18T14:00:00Z',
    profiles:    { full_name: 'Kabo Modise', community: 'University of Botswana' },
  },
  {
    id:          'entry-0003',
    title:       'Mophane Worm (Gonimbrasia belina) — Sustainable Harvesting',
    description: 'Mophane worms (phane in Setswana) are the larval stage of the Emperor moth and represent one of southern Africa\'s most important traditional protein sources. Indigenous harvesting practices in Botswana involve monitoring mophane woodland regeneration to avoid over-harvesting, traditionally restricted by community consensus to specific periods after the larvae have fed sufficiently. The worms are sun-dried or smoked for preservation — a technology predating modern food preservation by centuries.',
    category:    'conservation',
    access_tier: 'public',
    language:    'en',
    submitted_by:'demo-user-0001',
    verified:    true,
    verified_by: 'demo-elder-0001',
    sha256_hash: 'c5f8b3e6a1d4c7f0b3e6a9d2c5f8b1e4a7d0c3f6b9e2a5d8c1f4b7e0a3d6c9f2',
    // Selebi-Phikwe area — major mophane woodland in Central District
    latitude:    -22.0000,
    longitude:   27.8333,
    tags:        ['mophane', 'protein', 'harvesting', 'conservation', 'phane'],
    media_urls:  null,
    created_at:  '2026-03-01T09:00:00Z',
    updated_at:  '2026-03-01T09:00:00Z',
    profiles:    { full_name: 'Kabo Modise', community: 'University of Botswana' },
  },
  {
    id:          'entry-0004',
    title:       'Kgotla System — Indigenous Governance & Natural Resource Management',
    description: 'The kgotla is the traditional community assembly space and governance structure found throughout Botswana. Beyond judicial and civic functions, the kgotla historically regulated access to communal natural resources including grazing lands, water sources, and woodland areas. Chiefs and headmen issued seasonal restrictions on hunting, woodland burning, and water usage through the kgotla — creating an indigenous conservation management system predating formal environmental legislation.',
    category:    'cultural_narrative',
    access_tier: 'public',
    language:    'en',
    submitted_by:'demo-elder-0001',
    verified:    false,
    verified_by: null,
    sha256_hash: 'd6a9c4f7b2e5a8d1c4f7a0d3c6f9b2e5a8d1c4f7b0e3a6d9c2f5b8e1a4d7c0f3',
    // Gaborone — Dikgosi Monument / seat of traditional governance
    latitude:    -24.6571,
    longitude:   25.9089,
    tags:        ['kgotla', 'governance', 'conservation', 'Gaborone', 'communal'],
    media_urls:  null,
    created_at:  '2026-03-10T11:00:00Z',
    updated_at:  '2026-03-10T11:00:00Z',
    profiles:    { full_name: 'Mmamogolo Setlhare', community: 'Ngamiland District' },
  },
  {
    id:          'entry-0005',
    title:       'Mmidi (Grewia flava) — Medicinal and Nutritional Applications',
    description: 'Mmidi (raisin bush) is a widespread shrub found across the Kalahari. The small sweet berries are an important food source and were historically used to brew a fermented beverage. Roots are used in traditional medicine as a treatment for respiratory conditions including bronchitis, and a decoction of bark has documented use as an analgesic. The wood is used for making digging sticks and traditional tools due to its hardness.',
    category:    'flora_medicinal',
    access_tier: 'public',
    language:    'en',
    submitted_by:'demo-user-0001',
    verified:    true,
    verified_by: 'demo-elder-0001',
    sha256_hash: 'e7b0d5a2c5f8b1e4a7d0c3f6b9e2a5d8c1f4b7e0a3d6c9f2b5e8a1d4c7f0b3e6',
    // Kgalagadi Transfrontier Park — dense Grewia flava habitat
    latitude:    -25.2833,
    longitude:   21.8833,
    tags:        ['mmidi', 'Kalahari', 'medicinal', 'food', 'raisin bush'],
    media_urls:  null,
    created_at:  '2026-03-15T08:30:00Z',
    updated_at:  '2026-03-15T08:30:00Z',
    profiles:    { full_name: 'Kabo Modise', community: 'University of Botswana' },
  },
  {
    id:          'entry-0006',
    title:       'Tsodilo Hills — Sacred Landscape Oral Knowledge',
    description: 'The Tsodilo Hills in northwest Botswana are a UNESCO World Heritage Site and hold profound spiritual significance for the San and Hambukushu peoples. Oral traditions describe the hills as the site of creation — where the first man and woman were placed on earth. Knowledge about the hills includes reading seasonal signs in the rock formations, understanding the sacred protocol for approaching certain painting sites, and the plant medicines found only in this specific geological ecosystem.',
    category:    'cultural_narrative',
    access_tier: 'sacred',
    language:    'en',
    submitted_by:'demo-elder-0001',
    verified:    true,
    verified_by: 'demo-elder-0001',
    sha256_hash: 'f8c1e4b7a0d3c6f9b2e5a8d1c4f7b0e3a6d9c2f5b8e1a4d7c0f3b6e9a2d5c8f1',
    // Tsodilo Hills — exact UNESCO coordinates, NW Botswana
    latitude:    -18.7558,
    longitude:   21.7425,
    tags:        ['Tsodilo', 'sacred', 'San', 'UNESCO', 'rock art', 'creation'],
    media_urls:  null,
    created_at:  '2026-03-20T16:00:00Z',
    updated_at:  '2026-03-20T16:00:00Z',
    profiles:    { full_name: 'Mmamogolo Setlhare', community: 'Ngamiland District' },
  },
  {
    id:          'entry-0007',
    title:       'Sengaparile (Harpagophytum procumbens) — Devil\'s Claw Harvesting Ethics',
    description: 'Devil\'s Claw (sengaparile) is one of Botswana\'s most commercially valuable medicinal plants, used globally as an anti-inflammatory. Traditional community protocols govern sustainable harvesting: only secondary tubers are removed, leaving the primary tuber intact for plant survival. Communities document the seasonal best-practice window (April–June) and the minimum plant age before first harvest. Over-harvesting is discouraged through community consensus and elder-governed access zones.',
    category:    'flora_medicinal',
    access_tier: 'restricted',
    language:    'en',
    submitted_by:'demo-user-0001',
    verified:    true,
    verified_by: 'demo-elder-0001',
    sha256_hash: 'a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9a2b5c8d1e4f7a0b3c6d9e2f5a8b1c4',
    // Ghanzi District — prime Devil's Claw habitat in Botswana
    latitude:    -21.6833,
    longitude:   21.6500,
    tags:        ['sengaparile', "devil's claw", 'medicinal', 'commercial', 'sustainable'],
    media_urls:  null,
    created_at:  '2026-04-01T10:00:00Z',
    updated_at:  '2026-04-01T10:00:00Z',
    profiles:    { full_name: 'Kabo Modise', community: 'University of Botswana' },
  },
  {
    id:          'entry-0008',
    title:       'Okavango Delta — BaYei Water Management Traditions',
    description: 'The BaYei people of the Okavango Delta have developed sophisticated water-reading techniques over centuries. Knowledge includes reading flood channel patterns to predict seasonal inundation timing, mokoro (dugout canoe) navigation through papyrus channels using star and wind signs, and seasonal fish migration patterns. Fish traps (letloa) are constructed from reeds according to species-specific behavioral patterns. Water is considered a living entity requiring respectful interaction.',
    category:    'conservation',
    access_tier: 'public',
    language:    'en',
    submitted_by:'demo-elder-0001',
    verified:    false,
    verified_by: null,
    sha256_hash: 'b2c5d8e1f4a7b0c3d6e9a2b5c8d1e4f7a0b3c6d9e2f5a8b1c4d7e0f3a6b9c2d5',
    // Maun — gateway to the Okavango Delta, Ngamiland
    latitude:    -19.9833,
    longitude:   23.4167,
    tags:        ['Okavango', 'BaYei', 'water', 'mokoro', 'fishing', 'delta'],
    media_urls:  null,
    created_at:  '2026-04-05T13:00:00Z',
    updated_at:  '2026-04-05T13:00:00Z',
    profiles:    { full_name: 'Mmamogolo Setlhare', community: 'Ngamiland District' },
  },
]

// Map-optimised shape (lightweight, all entries with coords)
export const MOCK_MAP_ENTRIES = MOCK_ENTRIES
  .filter(e => e.latitude && e.longitude)
  .map(({ id, title, category, access_tier, latitude, longitude, verified }) => ({
    id, title, category, access_tier, latitude, longitude, verified,
  }))

// ─── Module 2 — Research Hub listings ────────────────────────────────────────
export const MOCK_LISTINGS: ResearchListing[] = [
  {
    id:                'listing-0001',
    title:             'Phytochemical Analysis of Morula Kernel Oil for Cosmetic Applications',
    abstract:          'This study presents a comprehensive phytochemical analysis of cold-pressed morula kernel oil sourced from wild-harvested trees in the Central Kalahari. We document the fatty acid profile (oleic 70.4%, palmitic 8.1%), tocopherol content, and anti-inflammatory markers identified through GC-MS analysis. The study proposes a standardised extraction protocol optimised for small-scale community processing units to enable direct benefit-sharing with harvesting communities.',
    full_document_url: null,
    status:            'published',
    license_type:      'cc_by',
    license_terms:     null,
    price:             0,
    author_id:         'demo-user-0001',
    sha256_hash:       'f8c1e4b7a0d3c6f9b2e5a8d1c4f7b0e3a6d9c2f5b8e1a4d7c0f3b6e9a2d5c8f1',
    view_count:        47,
    download_count:    12,
    tags:              ['morula', 'phytochemistry', 'cosmetics', 'community-benefit'],
    created_at:        '2026-03-05T09:00:00Z',
    updated_at:        '2026-03-05T09:00:00Z',
    profiles:          { full_name: 'Kabo Modise', community: 'University of Botswana' },
    collaborators:     [],
  },
  {
    id:                'listing-0002',
    title:             'Indigenous Water Conservation Techniques of the San Communities of the Kalahari',
    abstract:          'This ethnographic study documents the water-locating and conservation techniques practiced by San communities in the Kalahari — including the use of bi bulbs (Raphionacme burkei) as emergency water sources, water digging techniques in dry riverbeds, and seasonal migration patterns calibrated to water availability. The study argues for formal recognition of these techniques within Botswana\'s national water management frameworks.',
    full_document_url: null,
    status:            'open_for_collaboration',
    license_type:      'cc_by_sa',
    license_terms:     null,
    price:             0,
    author_id:         'demo-user-0001',
    sha256_hash:       'a9d2c5f8b1e4a7d0c3f6b9e2a5d8c1f4b7e0a3d6c9f2b5e8a1d4c7f0b3e6a9d2',
    view_count:        83,
    download_count:    31,
    tags:              ['San', 'water', 'Kalahari', 'ethnography', 'conservation'],
    created_at:        '2026-03-12T11:30:00Z',
    updated_at:        '2026-03-12T11:30:00Z',
    profiles:          { full_name: 'Kabo Modise', community: 'University of Botswana' },
    collaborators:     [
      {
        id:              'collab-0001',
        listing_id:      'listing-0002',
        collaborator_id: 'demo-elder-0001',
        contribution:    'Traditional knowledge documentation and elder interviews',
        credit_share:    25,
        joined_at:       '2026-03-20T08:00:00Z',
        profiles:        { full_name: 'Mmamogolo Setlhare' },
      }
    ],
  },
  {
    id:                'listing-0003',
    title:             'Devil\'s Claw Commercial Harvesting Impact on Wild Populations — 5 Year Study',
    abstract:          'A longitudinal field study tracking population density and tuber biomass of Harpagophytum procumbens across 12 study sites in the Kalahari. Analysis compares traditionally governed harvesting zones versus unregulated commercial zones. Findings strongly support integration of traditional community harvesting protocols into national export regulation. Recommendations include a community stewardship certification framework.',
    full_document_url: null,
    status:            'published',
    license_type:      'commercial',
    license_terms:     { royalty: '5%', terms: 'Academic use free; commercial licensing required' },
    price:             250,
    author_id:         'demo-user-0001',
    sha256_hash:       'b8e1d4a7f0c3b6e9a2d5c8f1b4e7a0c3d6e9b2e5a8d1c4f7b0e3a6d9c2f5b8e1',
    view_count:        124,
    download_count:    18,
    tags:              ['sengaparile', "devil's claw", 'population', 'commercial', 'regulation'],
    created_at:        '2026-04-02T14:00:00Z',
    updated_at:        '2026-04-02T14:00:00Z',
    profiles:          { full_name: 'Kabo Modise', community: 'University of Botswana' },
    collaborators:     [],
  },
  {
    id:                'listing-0004',
    title:             'Mophane Woodland Regeneration After Phane Harvesting — Community Monitoring Data',
    abstract:          'Three-season dataset monitoring mophane woodland (Colophospermum mopane) canopy recovery and caterpillar population dynamics across community-managed and unmanaged harvesting zones in the Central District. Data collected collaboratively with community members using participatory monitoring protocols. Results indicate community-managed zones recover 40% faster than unmanaged zones. Open for collaboration for statistical analysis.',
    full_document_url: null,
    status:            'open_for_collaboration',
    license_type:      'odc_by',
    license_terms:     null,
    price:             0,
    author_id:         'demo-user-0001',
    sha256_hash:       'c9f2b5e8a1d4c7f0b3e6a9d2c5f8b1e4a7d0c3f6b9e2a5d8c1f4b7e0a3d6c9f2',
    view_count:        56,
    download_count:    9,
    tags:              ['mophane', 'monitoring', 'regeneration', 'community', 'phane'],
    created_at:        '2026-04-10T08:00:00Z',
    updated_at:        '2026-04-10T08:00:00Z',
    profiles:          { full_name: 'Kabo Modise', community: 'University of Botswana' },
    collaborators:     [],
  },
]

// ─── Module 3 — Learning Hub courses + lessons ───────────────────────────────

export const MOCK_LESSONS_BY_COURSE: Record<string, Lesson[]> = {
  'course-0001': [
    {
      id: 'lesson-0101', course_id: 'course-0001', title: 'Introduction to Mokolwane Palm',
      description: 'Learn to identify the mokolwane palm and understand sustainable harvesting timing.',
      content_type: 'video', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      image_urls: null, text_content: null,
      materials_list: ['Mokolwane palm fronds', 'Sharp harvesting knife', 'Collection basket'],
      duration_mins: 12, sort_order: 0, is_free_preview: true,
      created_at: '2026-03-01T08:00:00Z',
    },
    {
      id: 'lesson-0102', course_id: 'course-0001', title: 'Preparing and Drying the Palm Leaves',
      description: 'How to strip, split, and sun-dry the fronds to the correct moisture level for weaving.',
      content_type: 'image_gallery', video_url: null,
      image_urls: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      ],
      text_content: 'Step 1: Harvest young fronds in early morning\nStep 2: Strip outer fibres\nStep 3: Lay flat in sun for 3-4 hours\nStep 4: Store in cool dry place',
      materials_list: ['Dried mokolwane fronds', 'Flat drying surface', 'Storage cloth'],
      duration_mins: 18, sort_order: 1, is_free_preview: false,
      created_at: '2026-03-01T09:00:00Z',
    },
    {
      id: 'lesson-0103', course_id: 'course-0001', title: 'Natural Dyeing with Plant Materials',
      description: 'Traditional dye sources: mophane berries for brown, mosukudu root for red.',
      content_type: 'text', video_url: null, image_urls: null,
      text_content: 'The colour palette of Botswana baskets comes entirely from plants:\n\n**Dark Brown:** Boil mophane berries (Colophospermum mopane) for 2 hours. Cool then soak fronds overnight.\n\n**Red-Orange:** Pound mosukudu root (Berchemia discolor), simmer 45 minutes. Add fronds while warm.\n\n**Yellow:** Morula bark outer layer, simmered 30 minutes.\n\n**Black:** Charcoal from mopane wood mixed with animal fat.',
      materials_list: ['Mophane berries', 'Mosukudu root', 'Large clay pot', 'Fire wood', 'Water'],
      duration_mins: 25, sort_order: 2, is_free_preview: false,
      created_at: '2026-03-01T10:00:00Z',
    },
    {
      id: 'lesson-0104', course_id: 'course-0001', title: 'The Spiral Coil Foundation Technique',
      description: 'Start your first basket with the traditional centre coil.',
      content_type: 'video', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      image_urls: null, text_content: null,
      materials_list: ['Prepared dyed fronds', 'Weaving needle', 'Awl or sharp stick'],
      duration_mins: 35, sort_order: 3, is_free_preview: false,
      created_at: '2026-03-01T11:00:00Z',
    },
  ],
  'course-0002': [
    {
      id: 'lesson-0201', course_id: 'course-0002', title: 'The Morama Bean — Introduction',
      description: 'History and cultural significance of morama in Kalahari communities.',
      content_type: 'text', video_url: null, image_urls: null,
      text_content: 'The morama bean (Tylosema esculentum) is sometimes called the desert truffle of Africa. Growing underground with a tuber that can weigh up to 300kg, it has sustained Kalahari communities through droughts for millennia.\n\nNutritional profile: 35% protein, 40% fat (mostly unsaturated), complete amino acid profile. Comparable to soybean in nutritional density.',
      materials_list: ['Morama beans (dried)', 'Mortar and pestle'],
      duration_mins: 10, sort_order: 0, is_free_preview: true,
      created_at: '2026-03-15T08:00:00Z',
    },
    {
      id: 'lesson-0202', course_id: 'course-0002', title: 'Roasting and Grinding Morama',
      description: 'Traditional dry roasting and stone-grinding technique.',
      content_type: 'video', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      image_urls: null, text_content: null,
      materials_list: ['Morama beans', 'Cast iron pan or clay pot', 'Grinding stone or mortar'],
      duration_mins: 22, sort_order: 1, is_free_preview: false,
      created_at: '2026-03-15T09:00:00Z',
    },
    {
      id: 'lesson-0203', course_id: 'course-0002', title: 'Seswaa with Morama Sauce',
      description: 'Traditional pounded beef seswaa served with a morama-based sauce.',
      content_type: 'image_gallery', video_url: null,
      image_urls: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'],
      text_content: null,
      materials_list: ['Seswaa (pounded beef)', 'Morama paste', 'Wild spinach (morama leaves)', 'Salt', 'Clay cooking pot'],
      duration_mins: 40, sort_order: 2, is_free_preview: false,
      created_at: '2026-03-15T10:00:00Z',
    },
  ],
  'course-0003': [
    {
      id: 'lesson-0301', course_id: 'course-0003', title: 'Understanding Tswana Geometric Patterns',
      description: 'The visual grammar of traditional Tswana pattern-making and its use in modern design.',
      content_type: 'image_gallery', video_url: null,
      image_urls: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      ],
      text_content: 'Key pattern families in Tswana design:\n\n1. Letlhafula (diamond/chevron) — prosperity and shelter\n2. Mothudi (triangle) — direction and leadership\n3. Mogala (spiral) — continuity of life\n4. Molelo (flame) — community warmth\n\nEach pattern has a colour and context protocol.',
      materials_list: [],
      duration_mins: 20, sort_order: 0, is_free_preview: true,
      created_at: '2026-04-01T08:00:00Z',
    },
    {
      id: 'lesson-0302', course_id: 'course-0003', title: 'Applying Tswana Patterns to Modern Homewares',
      description: 'Techniques for printing, stamping, and transferring traditional patterns onto contemporary objects.',
      content_type: 'video', video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      image_urls: null, text_content: null,
      materials_list: ['Fabric or ceramic surface', 'Block printing tools', 'Natural ochre or acrylic paint', 'Traditional pattern templates'],
      duration_mins: 45, sort_order: 1, is_free_preview: false,
      created_at: '2026-04-01T09:00:00Z',
    },
  ],
}

export const MOCK_COURSES: Course[] = [
  {
    id:                'course-0001',
    title:             'Traditional Tswana Basket Weaving',
    subtitle:          'From Mokolwane palm to finished lekupa in 4 lessons',
    description:       'Learn the complete art of Tswana basket weaving — from sustainable palm harvesting and natural dyeing using Kalahari plants, to the spiral coil technique that produces Botswana\'s world-famous patterns. Taught by a master weaver from Ngamiland with 30 years of practice. Every lesson includes materials lists with traditional and modern alternatives.',
    category:          'traditional_crafts',
    skill_level:       'beginner',
    language:          'en',
    creator_id:        'demo-elder-0001',
    cover_image_url:   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    preview_video_url: null,
    price_bwp:         150,
    status:            'approved',
    rejection_note:    null,
    reviewed_by:       'demo-elder-0001',
    reviewed_at:       '2026-03-02T10:00:00Z',
    enrolment_count:   34,
    rating_avg:        4.8,
    sha256_hash:       'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    created_at:        '2026-03-01T08:00:00Z',
    updated_at:        '2026-03-02T10:00:00Z',
    profiles:          { full_name: 'Mmamogolo Setlhare', community: 'Ngamiland District' },
    lessons:           MOCK_LESSONS_BY_COURSE['course-0001'],
  },
  {
    id:                'course-0002',
    title:             'Kalahari Heritage Cooking — Morama Bean & Wild Foods',
    subtitle:          'Cooking with traditional protein sources of the Kalahari Desert',
    description:       'Explore the rich culinary heritage of the Kalahari through 3 practical lessons covering the morama bean, traditional preparation methods, and classic dishes that have sustained communities for centuries. Learn the nutritional science behind these foods alongside the cultural protocols that govern their preparation and sharing.',
    category:          'culinary_heritage',
    skill_level:       'beginner',
    language:          'en',
    creator_id:        'demo-elder-0001',
    cover_image_url:   'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
    preview_video_url: null,
    price_bwp:         0,
    status:            'approved',
    rejection_note:    null,
    reviewed_by:       'demo-elder-0001',
    reviewed_at:       '2026-03-16T09:00:00Z',
    enrolment_count:   89,
    rating_avg:        4.9,
    sha256_hash:       'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
    created_at:        '2026-03-15T08:00:00Z',
    updated_at:        '2026-03-16T09:00:00Z',
    profiles:          { full_name: 'Mmamogolo Setlhare', community: 'Ngamiland District' },
    lessons:           MOCK_LESSONS_BY_COURSE['course-0002'],
  },
  {
    id:                'course-0003',
    title:             'Decoration in Modern Style Using Traditional Tswana Items',
    subtitle:          'Bring heritage patterns into contemporary living spaces',
    description:       'A creative course bridging traditional Tswana visual language with modern interior design and product decoration. Learn to identify and apply the geometric patterns found in kgotla architecture, traditional textiles, and basket designs to ceramics, fabric, and paper. Perfect for designers, artists, and heritage enthusiasts.',
    category:          'modern_fusion',
    skill_level:       'intermediate',
    language:          'en',
    creator_id:        'demo-user-0001',
    cover_image_url:   'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
    preview_video_url: null,
    price_bwp:         200,
    status:            'approved',
    rejection_note:    null,
    reviewed_by:       'demo-elder-0001',
    reviewed_at:       '2026-04-02T10:00:00Z',
    enrolment_count:   21,
    rating_avg:        4.6,
    sha256_hash:       'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
    created_at:        '2026-04-01T08:00:00Z',
    updated_at:        '2026-04-02T10:00:00Z',
    profiles:          { full_name: 'Kabo Modise', community: 'University of Botswana' },
    lessons:           MOCK_LESSONS_BY_COURSE['course-0003'],
  },
  {
    id:                'course-0004',
    title:             'Mophane Worm Harvesting & Preservation',
    subtitle:          'Sustainable practices for Botswana\'s seasonal protein source',
    description:       'A practical course on the traditional and modern techniques for harvesting, preparing, and preserving mophane worms (phane). Covers seasonal timing, sustainable harvesting ethics, sun-drying versus smoking methods, and traditional recipes including phane stew and dried phane snacks.',
    category:          'ecological_practices',
    skill_level:       'beginner',
    language:          'en',
    creator_id:        'demo-elder-0001',
    cover_image_url:   null,
    preview_video_url: null,
    price_bwp:         80,
    status:            'approved',
    rejection_note:    null,
    reviewed_by:       'demo-elder-0001',
    reviewed_at:       '2026-04-05T11:00:00Z',
    enrolment_count:   15,
    rating_avg:        4.7,
    sha256_hash:       'd4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5',
    created_at:        '2026-04-04T08:00:00Z',
    updated_at:        '2026-04-05T11:00:00Z',
    profiles:          { full_name: 'Mmamogolo Setlhare', community: 'Ngamiland District' },
    lessons:           [],
  },
]

// ─── Module 3 — Media Gallery items ──────────────────────────────────────────
export const MOCK_MEDIA_ITEMS: MediaItem[] = [
  {
    id:           'media-0001',
    title:        'Basket Weaving Demonstration — Mokolwane Spiral Start',
    description:  'Short demonstration of starting the spiral coil foundation',
    category:     'traditional_crafts',
    content_type: 'video',
    video_url:    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    image_urls:   null,
    creator_id:   'demo-elder-0001',
    view_count:   203,
    created_at:   '2026-03-10T08:00:00Z',
    profiles:     { full_name: 'Mmamogolo Setlhare', community: 'Ngamiland District' },
  },
  {
    id:           'media-0002',
    title:        'Natural Plant Dyes of the Kalahari — Photo Series',
    description:  '8-photo series showing dye preparation from Kalahari plants',
    category:     'ecological_practices',
    content_type: 'image_gallery',
    video_url:    null,
    image_urls:   [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
    ],
    creator_id:   'demo-user-0001',
    view_count:   88,
    created_at:   '2026-03-20T10:00:00Z',
    profiles:     { full_name: 'Kabo Modise', community: 'University of Botswana' },
  },
  {
    id:           'media-0003',
    title:        'Kgotla Architecture — Traditional Building Principles',
    description:  'Photo tour of traditional kgotla compound design',
    category:     'natural_building',
    content_type: 'image_gallery',
    video_url:    null,
    image_urls:   [
      'https://images.unsplash.com/photo-1566041510394-cf7c1b1edc43?w=600',
    ],
    creator_id:   'demo-elder-0001',
    view_count:   61,
    created_at:   '2026-04-01T12:00:00Z',
    profiles:     { full_name: 'Mmamogolo Setlhare', community: 'Ngamiland District' },
  },
  {
    id:           'media-0004',
    title:        'Seswaa Traditional Preparation — Full Process',
    description:  'Complete video of the pounding and seasoning process',
    category:     'culinary_heritage',
    content_type: 'video',
    video_url:    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    image_urls:   null,
    creator_id:   'demo-elder-0001',
    view_count:   142,
    created_at:   '2026-04-08T09:00:00Z',
    profiles:     { full_name: 'Mmamogolo Setlhare', community: 'Ngamiland District' },
  },
]

// ─── Filter helpers (used by mock page.tsx replacements) ─────────────────────

export function filterEntries(
  entries: KnowledgeEntry[],
  opts: { search?: string; category?: string; tier?: string }
): KnowledgeEntry[] {
  let out = [...entries]
  if (opts.search)   out = out.filter(e => e.title.toLowerCase().includes(opts.search!.toLowerCase()) || (e.description ?? '').toLowerCase().includes(opts.search!.toLowerCase()))
  if (opts.category) out = out.filter(e => e.category === opts.category)
  if (opts.tier)     out = out.filter(e => e.access_tier === opts.tier)
  return out
}

export function filterListings(
  listings: ResearchListing[],
  opts: { search?: string; license_type?: string; status?: string }
): ResearchListing[] {
  let out = listings.filter(l => l.status !== 'draft')
  if (opts.search)       out = out.filter(l => l.title.toLowerCase().includes(opts.search!.toLowerCase()) || (l.abstract ?? '').toLowerCase().includes(opts.search!.toLowerCase()))
  if (opts.license_type) out = out.filter(l => l.license_type === opts.license_type)
  if (opts.status)       out = out.filter(l => l.status === opts.status)
  return out
}

export function filterCourses(
  courses: Course[],
  opts: { search?: string; category?: string; skill_level?: string }
): Course[] {
  let out = courses.filter(c => c.status === 'approved')
  if (opts.search)      out = out.filter(c => c.title.toLowerCase().includes(opts.search!.toLowerCase()) || (c.description ?? '').toLowerCase().includes(opts.search!.toLowerCase()))
  if (opts.category)    out = out.filter(c => c.category === opts.category)
  if (opts.skill_level) out = out.filter(c => c.skill_level === opts.skill_level)
  return out
}

export function paginate<T>(items: T[], page: number, pageSize: number): { data: T[]; total: number; totalPages: number } {
  const total      = items.length
  const totalPages = Math.ceil(total / pageSize)
  const start      = (page - 1) * pageSize
  return { data: items.slice(start, start + pageSize), total, totalPages }
}
