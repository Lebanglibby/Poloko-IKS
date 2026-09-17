-- =============================================================
-- Poloko IKS — Demo Seed Data
-- Run this after 001_initial_schema.sql in your Supabase SQL editor
-- =============================================================

-- NOTE: In production, users are created via Supabase Auth.
-- For seeding demo data, we insert directly into profiles
-- with placeholder UUIDs that you would replace with real auth users.

-- Demo Knowledge Entries (public access — visible immediately)
INSERT INTO public.knowledge_entries (id, title, description, category, access_tier, language, sha256_hash, latitude, longitude, tags, verified)
VALUES
  (
    'a1b2c3d4-0001-0001-0001-000000000001',
    'Morula Tree (Sclerocarya birrea) — Traditional Uses',
    'The morula tree is one of Botswana''s most culturally significant trees. Traditional communities harvest the fruit for making marula beer (khadi), a fermented beverage used in ceremonies. The kernel oil is used for skin moisturising and has been documented as having anti-inflammatory properties. Bark decoctions are traditionally used for fever management and wound healing. The tree is considered sacred in some communities and felling is discouraged during fruiting season.',
    'flora_medicinal',
    'public',
    'en',
    'a3f5c8d2e1b4a7f6c9d0e3b2a1f4c7d8e2b5a8c3f6d1e4b7a0c5d2e8b3a6f9',
    -22.9576,
    24.6531,
    ARRAY['morula', 'medicinal', 'fruit', 'ceremony', 'Kalahari'],
    TRUE
  ),
  (
    'a1b2c3d4-0001-0001-0001-000000000002',
    'Mokolwane Palm (Hyphaene petersiana) — Weaving Traditions',
    'The mokolwane palm, found across the Okavango Delta and eastern Botswana, is the foundation of Botswana''s internationally recognised basket-weaving tradition. Communities in Ngamiland harvest young palm leaves in the early morning to prevent wilting. The leaves are dried, dyed using natural plant dyes including berries of the mophane (Colophospermum mopane) for dark browns, and roots of mosukudu for reds. Basket patterns encode clan identities and seasonal knowledge.',
    'traditional_practice',
    'public',
    'en',
    'b4e7a2f5c8d1e3b6a9f2c5d8e1b4a7f0c3d6e9b2a5f8c1d4e7b0a3f6c9d2e5',
    -19.4833,
    23.0833,
    ARRAY['palm', 'weaving', 'Okavango', 'craft', 'Ngamiland'],
    TRUE
  ),
  (
    'a1b2c3d4-0001-0001-0001-000000000003',
    'Mophane Worm (Gonimbrasia belina) — Sustainable Harvesting Practices',
    'Mophane worms (phane in Setswana) are the larval stage of the Emperor moth and represent one of southern Africa''s most important traditional protein sources. Indigenous harvesting practices in Botswana involve monitoring mophane woodland regeneration to avoid over-harvesting, traditionally restricted by community consensus to specific periods after the larvae have fed sufficiently. The worms are sun-dried or smoked for preservation — a technology predating modern food preservation by centuries.',
    'conservation',
    'public',
    'en',
    'c5f8b3e6a1d4c7f0b3e6a9d2c5f8b1e4a7d0c3f6b9e2a5d8c1f4b7e0a3d6c9',
    -21.1667,
    27.5000,
    ARRAY['mophane', 'protein', 'harvesting', 'conservation', 'phane'],
    TRUE
  ),
  (
    'a1b2c3d4-0001-0001-0001-000000000004',
    'Kgotla System — Community Governance and Natural Resource Management',
    'The kgotla is the traditional community assembly space and governance structure found throughout Botswana. Beyond judicial and civic functions, the kgotla historically regulated access to communal natural resources including grazing lands, water sources, and woodland areas. Chiefs and headmen issued seasonal restrictions on hunting, woodland burning, and water usage through the kgotla, creating an indigenous conservation management system that predates formal environmental legislation.',
    'cultural_narrative',
    'public',
    'en',
    'd6a9c4f7b2e5a8d1c4f7a0d3c6f9b2e5a8d1c4f7b0e3a6d9c2f5b8e1a4d7c0',
    -24.6571,
    25.9089,
    ARRAY['kgotla', 'governance', 'conservation', 'Gaborone', 'communal'],
    FALSE
  ),
  (
    'a1b2c3d4-0001-0001-0001-000000000005',
    'Mmidi (Grewia flava) — Medicinal and Nutritional Applications',
    'Mmidi (also called raisin bush) is a widespread shrub found across the Kalahari. The small sweet berries are an important food source and were historically used to brew a fermented beverage. Roots are used in traditional medicine as a treatment for respiratory conditions including bronchitis, and a decoction of bark has documented use as an analgesic. The wood is used for making digging sticks and traditional tools due to its hardness.',
    'flora_medicinal',
    'public',
    'en',
    'e7b0d5a2c5f8b1e4a7d0c3f6b9e2a5d8c1f4b7e0a3d6c9f2b5e8a1d4c7f0b3',
    -23.5000,
    23.0000,
    ARRAY['mmidi', 'Kalahari', 'medicinal', 'food', 'raisin bush'],
    TRUE
  );

-- =============================================================
-- Demo Researcher Profile (placeholder — replace UUID with real auth user)
-- In production, create the user via Supabase Auth and this row is
-- auto-created by the handle_new_user trigger. For seeding, insert directly.
-- =============================================================
INSERT INTO public.profiles (id, full_name, role, community, verified)
VALUES (
  'c3d4e5f6-0003-0003-0003-000000000001',
  'Dr. Kagiso Modise',
  'researcher',
  'University of Botswana',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- Demo Research Listings (published)
INSERT INTO public.research_listings (id, title, abstract, status, license_type, price, sha256_hash, tags, view_count, download_count, author_id)
VALUES
  (
    'b2c3d4e5-0002-0002-0002-000000000001',
    'Phytochemical Analysis of Morula (Sclerocarya birrea) Kernel Oil for Commercial Cosmetic Applications',
    'This study presents a comprehensive phytochemical analysis of cold-pressed morula kernel oil sourced from wild-harvested trees in the Central Kalahari. We document the fatty acid profile (oleic 70.4%, palmitic 8.1%), tocopherol content, and anti-inflammatory markers identified through GC-MS analysis. The study proposes a standardised extraction protocol optimised for small-scale community processing units to enable benefit-sharing directly with harvesting communities.',
    'published',
    'cc_by',
    0.00,
    'f8c1e4b7a0d3c6f9b2e5a8d1c4f7b0e3a6d9c2f5b8e1a4d7c0f3b6e9a2d5c8',
    ARRAY['morula', 'phytochemistry', 'cosmetics', 'community-benefit', 'Kalahari'],
    47,
    12,
    'c3d4e5f6-0003-0003-0003-000000000001'
  ),
  (
    'b2c3d4e5-0002-0002-0002-000000000002',
    'Indigenous Water Conservation Techniques of the San Communities of the Kalahari',
    'This ethnographic study documents the water-locating and conservation techniques practiced by San communities in the Kalahari — including the use of bi bulbs (Raphionacme burkei) as emergency water sources, water digging techniques in dry riverbeds, and seasonal migration patterns calibrated to water availability. The study argues for formal recognition of these techniques within Botswana''s national water management frameworks.',
    'open_for_collaboration',
    'cc_by_sa',
    0.00,
    'a9d2c5f8b1e4a7d0c3f6b9e2a5d8c1f4b7e0a3d6c9f2b5e8a1d4c7f0b3e6a9',
    ARRAY['San', 'water', 'Kalahari', 'ethnography', 'conservation', 'collaboration-needed'],
    83,
    31,
    'c3d4e5f6-0003-0003-0003-000000000001'
  );
